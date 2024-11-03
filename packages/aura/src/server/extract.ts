import sharp from "sharp";

import { Color, rgbToHex, medianCut, kMeansClustering } from "../core";

import type { AuraColor } from "../types";

/**
 * Extracts dominant colors from an image using server-side processing with Sharp.
 * Uses a hybrid approach combining Median Cut and k-means clustering.
 */
export async function extractColors(
  imageUrl: string,
  numColors: number = 6
): Promise<AuraColor[]> {
  // Download and process image
  const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const image = sharp(Buffer.from(imageBuffer));

  // Resize image for faster processing while maintaining aspect ratio
  const { data, info } = await image
    .resize(400, 400, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorMap = new Map<string, Color>();

  // Process every pixel (RGB format)
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;

    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, new Color(r, g, b));
    }
  }

  const colors = Array.from(colorMap.values());
  const totalPixels = info.width * info.height;

  // Use hybrid approach: Median Cut followed by K-means
  const medianCutColors = medianCut(colors, 3); // 2^3 = 8 initial colors
  const kMeansColors = kMeansClustering(medianCutColors, numColors);

  return kMeansColors
    .map((color) => ({
      hex: rgbToHex(color.r, color.g, color.b),
      weight: color.count / totalPixels,
    }))
    .sort((a, b) => b.weight - a.weight);
}
