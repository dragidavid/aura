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
 * Extracts dominant colors from an image URL using the browser's Canvas API.
 * Automatically handles image scaling and processing optimization.
 *
 * @param imageUrl - URL of the image
 * @param options - Configuration options
 * @param options.paletteSize - Number of colors to extract (1-12)
 * @param options.validateUrl - Whether to validate the image URL
 * @returns Array of AuraColor objects, sorted by dominance
 * @throws {Error} When image loading or processing fails
 */
export async function extractColors(
  imageUrl: string,
  options: {
    paletteSize?: number;
    validateUrl?: boolean;
  } = {}
): Promise<AuraColor[]> {
  if (!imageUrl) throw new Error("Image URL is required");

  const paletteSize = options.paletteSize ?? 6;

  if (paletteSize < 1 || paletteSize > 12) {
    throw new Error("Number of colors must be between 1 and 12");
  }

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

  const initialClusters = Math.ceil(Math.sqrt(paletteSize));
  const medianCutColors = medianCut(colors, initialClusters);
  const kMeansColors = kMeansClustering(medianCutColors, paletteSize);

  if (width * height > WARN_SIZE) {
    console.warn(
      `[@drgd/aura] - Processing large image (${width}x${height}px). Consider using a smaller image for better performance.`
    );
  }

  return kMeansColors
    .map((color) => ({
      hex: rgbToHex(color.r, color.g, color.b),
      weight: color.count / totalPixels,
    }))
    .sort((a, b) => b.weight - a.weight);
}
