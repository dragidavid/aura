import { useState, useEffect } from "react";

import { extractColors } from "./extract";
import { DEFAULT_FALLBACK_COLORS } from "../core";

import type { AuraColor, AuraResponse } from "../types";

/**
 * React hook for extracting colors from an image URL.
 *
 * @param imageUrl - URL of the image
 * @param options - Configuration options
 * @param options.paletteSize - Number of colors to extract (1-12)
 * @param options.fallbackColors - Custom fallback colors
 * @param options.onError - Error callback function
 * @returns Object containing colors, loading state, and error state
 */
export function useAura(
  imageUrl?: string | null,
  options: {
    paletteSize?: number;
    fallbackColors?: AuraColor[];
    onError?: (error: Error) => void;
  } = {}
): AuraResponse {
  const [state, setState] = useState<AuraResponse>({
    colors: [],
    isLoading: false,
    error: null,
  });

  const {
    paletteSize = 6,
    fallbackColors: optionFallbackColors,
    onError,
  } = options;
  const fallbackColors = optionFallbackColors ?? DEFAULT_FALLBACK_COLORS;

  useEffect(() => {
    if (!imageUrl) {
      setState({
        colors: fallbackColors.slice(0, paletteSize),
        isLoading: false,
        error: null,
      });

      return;
    }

    let currentImageUrl = imageUrl;

    // If it's a relative path, make it absolute.
    if (
      typeof window !== "undefined" &&
      currentImageUrl.startsWith("/") &&
      !currentImageUrl.startsWith("//")
    ) {
      currentImageUrl = `${window.location.origin}${currentImageUrl}`;
    }

    let mounted = true;
    const abortController = new AbortController();

    async function processUrl(urlToProcess: string) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const timeoutId = setTimeout(() => {
          if (mounted) {
            abortController.abort();

            const timeoutError = new Error(
              "[@drgd/aura] - Color extraction timed out"
            );

            setState({
              colors: fallbackColors.slice(0, paletteSize),
              isLoading: false,
              error: timeoutError,
            });

            options.onError?.(timeoutError);
          }
        }, 10000);

        const result = await extractColors(urlToProcess, { paletteSize });

        clearTimeout(timeoutId);

        if (mounted) {
          setState({
            colors: result,
            isLoading: false,
            error: null,
          });
        }
      } catch (e) {
        if (!mounted) return;

        const error = e instanceof Error ? e : new Error(String(e));

        setState({
          colors: fallbackColors.slice(0, paletteSize),
          isLoading: false,
          error,
        });

        options.onError?.(error);
      }
    }

    processUrl(currentImageUrl);

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [imageUrl, paletteSize, onError]);

  return state;
}
