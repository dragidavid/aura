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
 * @param imageUrlOrBuffer - URL of the image or a Buffer
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
  imageUrlOrBuffer: string | Buffer,
  options: {
    paletteSize?: number;
    timeout?: number;
    maxSize?: number;
    quality?: "low" | "medium" | "high";
    validateUrl?: boolean;
    fallbackColors?: AuraColor[];
  } = {}
): Promise<AuraColor[]> {
  const paletteSize = options.paletteSize ?? 6;

  if (paletteSize < 1 || paletteSize > 12) {
    throw new Error("Number of colors must be between 1 and 12");
  }

  // Handle URL validation separately if input is a string and validation is enabled
  if (
    typeof imageUrlOrBuffer === "string" &&
    options.validateUrl !== false &&
    !imageUrlOrBuffer.startsWith("data:")
  ) {
    try {
      await validateImageUrl(imageUrlOrBuffer);
    } catch (e) {
      // If validateImageUrl throws, re-throw the error to make extractColors reject.
      // This is expected by tests checking for URL validation failures.
      throw e;
    }
  }

  // Proceed with fetching (if URL) and processing, with fallbacks for errors in this stage
  try {
    let imageProcessingBuffer: Buffer;
    const targetSize =
      options.quality === "low"
        ? 200
        : options.quality === "medium"
          ? 400
          : options.quality === "high"
            ? 800
            : MAX_IMAGE_SIZE;

    if (Buffer.isBuffer(imageUrlOrBuffer)) {
      imageProcessingBuffer = imageUrlOrBuffer;
    } else if (typeof imageUrlOrBuffer === "string") {
      // Fetch if it's a string (URL or Data URL)
      // No need to re-validate here if it passed the block above or is a data URL/validation disabled
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        options.timeout ?? 10000
      );

      const response = await fetch(imageUrlOrBuffer, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok)
        throw new Error(`Failed to fetch image: ${response.statusText}`);

      const arrayBuffer = await response.arrayBuffer();
      imageProcessingBuffer = Buffer.from(arrayBuffer);
    } else {
      throw new Error("Invalid input: Must be a URL string or a Buffer.");
    }

    const image = sharp(imageProcessingBuffer);
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
  } catch (e) {
    // This catch block now handles errors from fetching (for valid URLs) or sharp processing.
    const fallback = options.fallbackColors ?? DEFAULT_FALLBACK_COLORS;

    console.error(
      `[@drgd/aura] - Failed to extract colors during processing: ${e instanceof Error ? e.message : "Unknown error"}`
    );

    return fallback.slice(0, paletteSize).map((color) => ({
      ...color,
      weight:
        color.weight /
        fallback.slice(0, paletteSize).reduce((sum, c) => sum + c.weight, 0),
    }));
  }
}
