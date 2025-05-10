import { describe, it, expect, vi, beforeEach } from "vitest";
import sharp from "sharp";

import { extractColors as getAura } from "./extract";
import * as core from "../core";
import { DEFAULT_FALLBACK_COLORS } from "../core";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("../core", async (importOriginal) => {
  const originalCore = await importOriginal<typeof core>();

  return {
    ...originalCore,
    validateImageUrl: vi.fn().mockResolvedValue(true),
  };
});

const mockSharpInstance = {
  rotate: vi.fn(() => mockSharpInstance),
  resize: vi.fn(() => mockSharpInstance),
  removeAlpha: vi.fn(() => mockSharpInstance),
  raw: vi.fn(() => mockSharpInstance),
  toBuffer: vi.fn(),
  metadata: vi.fn(),
};
vi.mock("sharp", () => ({
  default: vi.fn(() => mockSharpInstance),
}));

function createMockResponse(
  status: number,
  ok: boolean,
  headers: Record<string, string> = {},
  buffer?: ArrayBuffer
): Partial<Response> {
  const responseHeaders = new Headers(headers);

  return {
    ok,
    status,
    headers: responseHeaders,
    arrayBuffer: () => Promise.resolve(buffer ?? new ArrayBuffer(0)),
  };
}

function createMockSharpOutput(width = 10, height = 10, channels = 3) {
  const pixelData = Buffer.alloc(width * height * channels);

  for (let i = 0; i < pixelData.length; i += channels) {
    // Simple pattern: Vary R based on index
    const r = ((i / channels) % 250) + 25; // Ensure > 20 and < 760 total
    pixelData[i] = r; // R
    pixelData[i + 1] = 50; // G
    pixelData[i + 2] = 100; // B
  }
  return {
    data: pixelData,
    info: { width, height, channels, size: pixelData.length },
  };
}

describe("getAura (Server Extract)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.validateImageUrl).mockResolvedValue(true);

    mockFetch.mockReset();
    mockSharpInstance.toBuffer.mockReset();
    mockSharpInstance.metadata.mockReset();
  });

  it("should return extracted colors for a valid image URL", async () => {
    const mockImageBuffer = new ArrayBuffer(100);
    const mockSharpOutput = createMockSharpOutput(50, 50);

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, {}, mockImageBuffer)
    );
    mockSharpInstance.metadata.mockResolvedValueOnce({
      width: 100,
      height: 100,
    });
    mockSharpInstance.toBuffer.mockResolvedValueOnce(mockSharpOutput);

    const colors = await getAura("https://example.com/valid.jpg");

    expect(core.validateImageUrl).toHaveBeenCalledWith(
      "https://example.com/valid.jpg"
    );
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(sharp).toHaveBeenCalledWith(Buffer.from(mockImageBuffer));
    expect(mockSharpInstance.toBuffer).toHaveBeenCalledOnce();
    expect(colors).toBeInstanceOf(Array);
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.length).toBeLessThanOrEqual(6);
    expect(colors[0]).toHaveProperty("hex");
    expect(colors[0]).toHaveProperty("weight");
  });

  it("should process a valid Buffer input without calling validateImageUrl", async () => {
    const mockImageBuffer = Buffer.from("dummy-buffer-data"); // More realistic buffer if needed for sharp mock
    const mockSharpOutput = createMockSharpOutput(30, 30);

    mockSharpInstance.metadata.mockResolvedValueOnce({ width: 30, height: 30 });
    mockSharpInstance.toBuffer.mockResolvedValueOnce(mockSharpOutput);

    const colors = await getAura(mockImageBuffer);

    expect(core.validateImageUrl).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled(); // Should not fetch for buffer input
    expect(sharp).toHaveBeenCalledWith(mockImageBuffer);
    expect(mockSharpInstance.toBuffer).toHaveBeenCalledOnce();
    expect(colors).toBeInstanceOf(Array);
    expect(colors.length).toBeGreaterThan(0);
    // Further assertions as in the valid URL test
    expect(colors[0]).toHaveProperty("hex");
    expect(colors[0]).toHaveProperty("weight");
  });

  it("should throw if URL validation fails", async () => {
    vi.mocked(core.validateImageUrl).mockRejectedValueOnce(
      new Error("Invalid URL")
    );

    await expect(getAura("invalid-url")).rejects.toThrow("Invalid URL");

    expect(mockFetch).not.toHaveBeenCalled();
    expect(sharp).not.toHaveBeenCalled();
  });

  it("should skip URL validation if validateUrl is false", async () => {
    const mockImageBuffer = new ArrayBuffer(100);
    const mockSharpOutput = createMockSharpOutput(50, 50);

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, {}, mockImageBuffer)
    );
    mockSharpInstance.metadata.mockResolvedValueOnce({
      width: 100,
      height: 100,
    });
    mockSharpInstance.toBuffer.mockResolvedValueOnce(mockSharpOutput);

    await getAura("https://example.com/valid.jpg", { validateUrl: false });

    expect(core.validateImageUrl).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(sharp).toHaveBeenCalledOnce();
  });

  it("should return fallback colors if fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const colors = await getAura("https://example.com/network-error.jpg");

    expect(colors).toHaveLength(DEFAULT_FALLBACK_COLORS.length);

    colors.forEach((color, index) => {
      expect(color.hex).toBe(DEFAULT_FALLBACK_COLORS[index]?.hex);
      expect(color.weight).toBeCloseTo(
        DEFAULT_FALLBACK_COLORS[index]?.weight ?? 0
      );
    });

    expect(sharp).not.toHaveBeenCalled();
  });

  it("should return fallback colors if fetch returns non-ok status", async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse(404, false));

    const colors = await getAura("https://example.com/notfound.jpg");

    expect(colors).toHaveLength(DEFAULT_FALLBACK_COLORS.length);
    colors.forEach((color, index) => {
      expect(color.hex).toBe(DEFAULT_FALLBACK_COLORS[index]?.hex);
      expect(color.weight).toBeCloseTo(
        DEFAULT_FALLBACK_COLORS[index]?.weight ?? 0
      );
    });

    expect(sharp).not.toHaveBeenCalled();
  });

  it("should return fallback colors if sharp processing fails", async () => {
    const mockImageBuffer = new ArrayBuffer(100);

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, {}, mockImageBuffer)
    );
    mockSharpInstance.metadata.mockResolvedValueOnce({
      width: 100,
      height: 100,
    });
    mockSharpInstance.toBuffer.mockRejectedValueOnce(new Error("Sharp failed")); // Simulate sharp error

    const colors = await getAura("https://example.com/corrupted.jpg");

    expect(colors).toHaveLength(DEFAULT_FALLBACK_COLORS.length);

    colors.forEach((color, index) => {
      expect(color.hex).toBe(DEFAULT_FALLBACK_COLORS[index]?.hex);
      expect(color.weight).toBeCloseTo(
        DEFAULT_FALLBACK_COLORS[index]?.weight ?? 0
      );
    });
  });

  it("should respect paletteSize option", async () => {
    const mockImageBuffer = new ArrayBuffer(100);
    const mockSharpOutput = createMockSharpOutput(50, 50);

    mockFetch.mockResolvedValueOnce(
      createMockResponse(200, true, {}, mockImageBuffer)
    );
    mockSharpInstance.metadata.mockResolvedValueOnce({
      width: 100,
      height: 100,
    });
    mockSharpInstance.toBuffer.mockResolvedValueOnce(mockSharpOutput);

    const paletteSize = 3;
    const colors = await getAura("https://example.com/valid.jpg", {
      paletteSize,
    });

    expect(colors.length).toBeLessThanOrEqual(paletteSize);
  });

  it("should return custom fallback colors on failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Fetch error"));

    const customFallbacks = [{ hex: "#111111", weight: 1 }];
    const paletteSize = 1;
    const colors = await getAura("https://example.com/fail.jpg", {
      fallbackColors: customFallbacks,
      paletteSize,
    });

    expect(colors).toEqual(customFallbacks.slice(0, paletteSize));
  });

  it("should throw if paletteSize is out of range", async () => {
    await expect(
      getAura("https://example.com/valid.jpg", { paletteSize: 0 })
    ).rejects.toThrow(/Number of colors must be between 1 and 12/i);
    await expect(
      getAura("https://example.com/valid.jpg", { paletteSize: 13 })
    ).rejects.toThrow(/Number of colors must be between 1 and 12/i);
  });
});
