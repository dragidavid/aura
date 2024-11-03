import { useState, useEffect } from "react";
import type { ColorInfo } from "../core/color";
import { extractColors } from "../browser/extract";

interface UseAuraResult {
  colors: ColorInfo[];
  isLoading: boolean;
  error: Error | null;
}

export function useAura(
  imageUrl: string,
  numColors: number = 6
): UseAuraResult {
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
