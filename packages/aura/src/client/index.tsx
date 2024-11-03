import { useState, useEffect } from "react";
import { Color, ColorInfo, rgbToHex } from "../core/color";
import { medianCut } from "../core/median-cut";
import { kMeansClustering } from "../core/kmeans";

export async function extractColors(
  imageUrl: string,
  numColors: number = 6
): Promise<ColorInfo[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);

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

  return kMeansColors
    .map((color) => ({
      hex: rgbToHex(color.r, color.g, color.b),
      weight: color.count / totalPixels,
    }))
    .sort((a, b) => b.weight - a.weight);
}

interface AuraResult {
  colors: ColorInfo[];
  isLoading: boolean;
  error: Error | null;
}

export function extractAura(
  imageUrl: string,
  numColors: number = 6
): AuraResult {
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchColors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await extractColors(imageUrl, numColors);
        if (mounted) {
          setColors(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchColors();

    return () => {
      mounted = false;
    };
  }, [imageUrl, numColors]);

  return { colors, isLoading, error };
}

export type { AuraResult };
export type { ColorInfo } from "../core/color";
