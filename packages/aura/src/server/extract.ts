import sharp from "sharp";

import {
  Color,
  rgbToHex,
  medianCut,
  kMeansClustering,
  validateImageUrl,
} from "../core";

import type { AuraColor } from "../types";

const MAX_IMAGE_SIZE = 400; // Maximum dimension for processing
const BATCH_SIZE = 1000; // Number of pixels to process in each batch

/**
 * Extracts dominant colors from an image using server-side processing with Sharp.
 * Using a combination of median cut and k-means clustering algorithms.
 *
 * @param imageUrl - The URL of the image to extract colors from. Must be CORS-enabled or from the same origin.
 * @param numColors - The number of colors to extract from the image. Defaults to 6.
 * @param options - Additional options for processing
 * @returns A promise that resolves to an array of {@link AuraColor} objects, sorted by weight (most dominant first).
 * @throws {Error} If image processing fails
 */
export async function extractColors(
  imageUrl: string,
  numColors: number = 6,
  options: {
    timeout?: number;
    maxSize?: number;
    quality?: "low" | "medium" | "high";
    validateUrl?: boolean;
  } = {}
): Promise<AuraColor[]> {
  // Validate input
  if (!imageUrl) throw new Error("Image URL is required");
  if (numColors < 1 || numColors > 32)
    throw new Error("Number of colors must be between 1 and 32");

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

    // Get image metadata
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

    // Optimize color extraction for small images
    const initialClusters = Math.min(3, Math.ceil(Math.log2(numColors)));
    const medianCutColors = medianCut(colors, initialClusters);
    const kMeansColors = kMeansClustering(medianCutColors, numColors);

    return kMeansColors
      .map((color) => ({
        hex: rgbToHex(color.r, color.g, color.b),
        weight: color.count / totalPixels,
      }))
      .sort((a, b) => b.weight - a.weight);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Color extraction failed: ${error.message}`);
    }
    throw error;
  }
}
