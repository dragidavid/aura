import {
  Color,
  rgbToHex,
  medianCut,
  kMeansClustering,
  validateImageUrl,
} from "../core";

import type { AuraColor } from "../types";

const MAX_IMAGE_SIZE = 2000; // Maximum dimension in pixels
const WARN_SIZE = 1500 * 1500; // Warning threshold for total pixels

function getScaledDimensions(width: number, height: number, maxSize: number) {
  if (width <= maxSize && height <= maxSize) return { width, height };

  const ratio = width / height;
  return ratio > 1
    ? { width: maxSize, height: Math.round(maxSize / ratio) }
    : { width: Math.round(maxSize * ratio), height: maxSize };
}

/**
 * Extracts dominant colors from an image URL using a combination of median cut and k-means clustering algorithms.
 * This function is designed to run in the browser environment (client) and uses the Canvas API.
 *
 * @param imageUrl - The URL of the image to extract colors from. Must be CORS-enabled or from the same origin.
 * @param numColors - The number of colors to extract from the image. Defaults to 6.
 * @param options - Additional options for processing
 * @returns A promise that resolves to an array of {@link AuraColor} objects, sorted by weight (most dominant first).
 * @throws {Error} If the canvas context cannot be obtained or if there are issues loading the image.
 */
export async function extractColors(
  imageUrl: string,
  numColors: number = 6,
  options: {
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

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = imageUrl;
  });

  // Scale down large images
  const { width, height } = getScaledDimensions(
    img.width,
    img.height,
    MAX_IMAGE_SIZE
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const colorMap = new Map<string, Color>();

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]!;
    const g = pixels[i + 1]!;
    const b = pixels[i + 2]!;
    const a = pixels[i + 3]!;

    if (a === 0) continue;

    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);

    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, new Color(r, g, b));
    }
  }

  const colors = Array.from(colorMap.values());
  const totalPixels = colors.reduce((sum, color) => sum + color.count, 0);

  const medianCutColors = medianCut(colors, 3);
  const kMeansColors = kMeansClustering(medianCutColors, numColors);

  if (width * height > WARN_SIZE) {
    console.warn(
      `Processing large image (${width}x${height}px). ` +
        "This may impact performance. Consider using a smaller image."
    );
  }

  return kMeansColors
    .map((color) => ({
      hex: rgbToHex(color.r, color.g, color.b),
      weight: color.count / totalPixels,
    }))
    .sort((a, b) => b.weight - a.weight);
}
