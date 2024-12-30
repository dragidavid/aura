import { useState, useEffect } from "react";

import { extractColors } from "./extract";

import type { AuraColor } from "../types";

type AuraResponse = {
  colors: AuraColor[];
  isLoading: boolean;
  error: Error | null;
};

/**
 * A React hook that extracts dominant colors from an image URL.
 *
 * @param imageUrl - The URL of the image to extract colors from. Must be CORS-enabled or from the same origin.
 * @param numColors - The number of colors to extract from the image. Defaults to 6.
 * @returns An object containing the extracted colors, a loading state, and an error state.
 */
export function useAura(imageUrl: string, numColors: number = 6): AuraResponse {
  const [state, setState] = useState<AuraResponse>({
    colors: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    if (!imageUrl) {
      setState({ colors: [], isLoading: false, error: null });

      return;
    }

    let abortController = new AbortController();
    let mounted = true;

    const getColors = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const timeoutId = setTimeout(() => {
          if (mounted) {
            setState((prev) => ({
              ...prev,
              error: new Error("Color extraction timed out"),
              isLoading: false,
            }));
          }
        }, 10000); // 10 second timeout

        const result = await extractColors(imageUrl, numColors);

        clearTimeout(timeoutId);

        if (mounted) {
          setState({
            colors: result,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState({
            colors: [],
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    };

    getColors();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [imageUrl, numColors]);

  return state;
}
