import { useState, useEffect } from "react";

import { extractColors } from "./extract";

import type { AuraColor } from "../types";

type AuraResponse = {
  colors: AuraColor[];
  isLoading: boolean;
  error: Error | null;
};

function extractAura(imageUrl: string, numColors: number = 6): AuraResponse {
  const [colors, setColors] = useState<AuraColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const getColors = async () => {
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

    getColors();

    return () => {
      mounted = false;
    };
  }, [imageUrl, numColors]);

  return { colors, isLoading, error };
}

export { extractAura };
export type { AuraResponse, AuraColor };
