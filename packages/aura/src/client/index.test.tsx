/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import { useAura } from "./index";
import * as clientExtract from "./extract";
import { DEFAULT_FALLBACK_COLORS } from "../core";

import type { AuraColor } from "../types";

const mockExtractColors = vi.spyOn(clientExtract, "extractColors");

describe("useAura Hook", () => {
  const testImageUrl = "https://example.com/test.jpg";
  const testColors: AuraColor[] = [{ hex: "#123456", weight: 1 }];
  const testError = new Error("Test extraction error");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with loading:false and empty colors if no initial input", () => {
    const { result } = renderHook(() => useAura(null));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.colors).toEqual(DEFAULT_FALLBACK_COLORS.slice(0, 6));
    expect(mockExtractColors).not.toHaveBeenCalled();
  });

  it("should set isLoading to true during URL processing", async () => {
    mockExtractColors.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(testColors), 50))
    );
    const { result } = renderHook(() => useAura(testImageUrl));

    await waitFor(() => {
      if (!result.current.isLoading) {
        expect(result.current.isLoading).toBe(false);
      } else {
        expect(result.current.isLoading).toBe(true);
      }
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("should return colors and set loading to false on successful extraction for URL", async () => {
    mockExtractColors.mockResolvedValueOnce(testColors);

    const { result } = renderHook(() => useAura(testImageUrl));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.colors).toEqual(testColors);
    });
  });

  it("should initialize with loading state and empty colors when URL is provided", () => {
    const { result } = renderHook(() => useAura(testImageUrl));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.colors).toEqual([]);
    expect(mockExtractColors).toHaveBeenCalled();
  });

  it("should set isLoading true then false, return colors on successful URL extraction", async () => {
    mockExtractColors.mockResolvedValueOnce(testColors);

    const { result } = renderHook(() => useAura(testImageUrl));

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.colors).toEqual(testColors);
  });

  it("should return fallback colors and set error state on extraction failure", async () => {
    mockExtractColors.mockRejectedValueOnce(testError);

    const { result } = renderHook(() => useAura(testImageUrl));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(testError);
    expect(result.current.colors).toEqual(DEFAULT_FALLBACK_COLORS.slice(0, 6));
  });

  it("should use custom fallback colors on failure", async () => {
    const customFallbacks = [{ hex: "#custom", weight: 1 }];

    mockExtractColors.mockRejectedValueOnce(testError);

    const { result } = renderHook(() =>
      useAura(testImageUrl, { fallbackColors: customFallbacks })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(testError);
    expect(result.current.colors).toEqual(customFallbacks.slice(0, 6));
  });

  it("should call onError callback on failure", async () => {
    const onErrorMock = vi.fn();

    mockExtractColors.mockRejectedValueOnce(testError);

    renderHook(() => useAura(testImageUrl, { onError: onErrorMock }));

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith(testError);
    });
  });

  it("should re-fetch when imageUrl changes", async () => {
    mockExtractColors.mockResolvedValue(testColors);

    const { rerender } = renderHook(
      ({ url }: { url: string | null | undefined }) => useAura(url),
      {
        initialProps: { url: testImageUrl },
      }
    );

    await waitFor(() => expect(mockExtractColors).toHaveBeenCalledTimes(1));

    mockExtractColors.mockResolvedValueOnce([{ hex: "#abcdef", weight: 1 }]);

    const newImageUrl = "https://example.com/new.jpg";

    rerender({ url: newImageUrl });

    await waitFor(() => {
      expect(mockExtractColors).toHaveBeenCalledTimes(2);
      expect(mockExtractColors).toHaveBeenLastCalledWith(newImageUrl, {
        paletteSize: 6,
      });
    });
  });

  it("should re-fetch when paletteSize changes", async () => {
    mockExtractColors.mockResolvedValue(testColors);

    const { rerender, result } = renderHook(
      ({ size }: { size: number }) =>
        useAura(testImageUrl, { paletteSize: size }),
      {
        initialProps: { size: 6 },
      }
    );

    await waitFor(() => expect(mockExtractColors).toHaveBeenCalledTimes(1));

    expect(mockExtractColors).toHaveBeenLastCalledWith(testImageUrl, {
      paletteSize: 6,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      rerender({ size: 3 });
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => {
      expect(mockExtractColors).toHaveBeenCalledTimes(2);
      expect(mockExtractColors).toHaveBeenLastCalledWith(testImageUrl, {
        paletteSize: 3,
      });
    });
  });

  it("should handle timeout", async () => {
    vi.useFakeTimers();

    mockExtractColors.mockImplementationOnce(() => new Promise(() => {}));

    const { result } = renderHook(() => useAura(testImageUrl));

    expect(result.current.isLoading).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10001);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain("timed out");
    expect(result.current.colors).toEqual(DEFAULT_FALLBACK_COLORS.slice(0, 6));

    vi.useRealTimers();
  });

  it("should return fallback colors immediately if imageUrl is empty string", () => {
    const { result } = renderHook(() => useAura(""));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.colors).toEqual(DEFAULT_FALLBACK_COLORS.slice(0, 6));
    expect(mockExtractColors).not.toHaveBeenCalled();
  });

  it("should return fallback colors immediately if imageUrl is null", () => {
    const { result } = renderHook(() => useAura(null));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.colors).toEqual(DEFAULT_FALLBACK_COLORS.slice(0, 6));
    expect(mockExtractColors).not.toHaveBeenCalled();
  });
});
