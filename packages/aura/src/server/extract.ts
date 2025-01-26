import sharp from "sharp";

import {
  Color,
  rgbToHex,
  medianCut,
  kMeansClustering,
  validateImageUrl,
  DEFAULT_FALLBACK_COLORS,
} from "../core";

import type { AuraColor } from "../types";

const MAX_IMAGE_SIZE = 400; // Maximum dimension for processing
const BATCH_SIZE = 1000; // Number of pixels to process in each batch

/**
 * Extracts dominant colors from an image using server-side processing.
 *
 * Uses Sharp for image processing and combines median cut with k-means clustering.
 * Includes automatic image scaling and optimization.
 *
 * @param imageUrl - URL of the image
 * @param options - Configuration options
 * @param options.paletteSize - Number of colors to extract (1-12)
 * @param options.timeout - Maximum processing time in ms
 * @param options.quality - Processing quality (low/medium/high)
 * @param options.validateUrl - Whether to validate the image URL
 * @param options.fallbackColors - Custom fallback colors
 * @returns Promise resolving to array of AuraColor objects, sorted by dominance
 * @throws {Error} When image processing fails
 */
export async function extractColors(
  imageUrl: string,
  options: {
    paletteSize?: number;
    timeout?: number;
    maxSize?: number;
    quality?: "low" | "medium" | "high";
    validateUrl?: boolean;
    fallbackColors?: AuraColor[];
  } = {}
): Promise<AuraColor[]> {
  if (!imageUrl) throw new Error("Image URL is required");

  const paletteSize = options.paletteSize ?? 6;

  if (paletteSize < 1 || paletteSize > 12) {
    throw new Error("Number of colors must be between 1 and 12");
  }

  // Validate URL if enabled
  if (options.validateUrl !== false) {
    await validateImageUrl(imageUrl);
  }

  // Set quality-based dimensions
  const targetSize =
    options.quality === "low"
      ? 200
      : options.quality === "medium"
        ? 400
        : options.quality === "high"
          ? 800
          : MAX_IMAGE_SIZE;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeout ?? 10000
    );

    const response = await fetch(imageUrl, { signal: controller.signal });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const image = sharp(Buffer.from(imageBuffer));
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid image dimensions");
    }

    // Optimize image processing
    const processedImage = image
      .rotate() // Auto-rotate based on EXIF
      .resize(targetSize, targetSize, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .removeAlpha() // Ensure RGB output
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Process image data
    const { data, info } = await processedImage;
    const colorMap = new Map<string, Color>();

    // Process pixels in batches for better memory usage
    for (let i = 0; i < data.length; i += 3 * BATCH_SIZE) {
      const batchEnd = Math.min(i + 3 * BATCH_SIZE, data.length);

      for (let j = i; j < batchEnd; j += 3) {
        const r = data[j]!;
        const g = data[j + 1]!;
        const b = data[j + 2]!;

        // Skip near-black and near-white pixels
        if (r + g + b < 20 || r + g + b > 760) continue;

        const key = `${r},${g},${b}`;
        const existing = colorMap.get(key);

        if (existing) {
          existing.count++;
        } else {
          colorMap.set(key, new Color(r, g, b));
        }
      }
    }

    const colors = Array.from(colorMap.values());
    const totalPixels = info.width * info.height;

    // Calculate appropriate initial clusters based on desired colors
    const initialClusters = Math.ceil(Math.sqrt(paletteSize));
    const medianCutColors = medianCut(colors, initialClusters);
    const kMeansColors = kMeansClustering(medianCutColors, paletteSize);

    return kMeansColors
      .map((color) => ({
        hex: rgbToHex(color.r, color.g, color.b),
        weight: color.count / totalPixels,
      }))
      .sort((a, b) => b.weight - a.weight);
  } catch (error) {
    const fallback = options.fallbackColors ?? DEFAULT_FALLBACK_COLORS;

    console.error(
      "Failed to extract colors:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return fallback.slice(0, paletteSize).map((color) => ({
      ...color,
      weight:
        color.weight /
        fallback.slice(0, paletteSize).reduce((sum, c) => sum + c.weight, 0),
    }));
  }
}
