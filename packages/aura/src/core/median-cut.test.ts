import { describe, it, expect } from "vitest";

import { Color } from "./color";
import { medianCut } from "./median-cut";

describe("medianCut", () => {
  it("should return a single average color if depth is 0", () => {
    const colors = [new Color(100, 0, 0), new Color(0, 100, 0)];
    const result = medianCut(colors, 0);

    expect(result).toHaveLength(1);
    expect(result[0]?.r).toBe(50);
    expect(result[0]?.g).toBe(50);
    expect(result[0]?.b).toBe(0);
  });

  it("should return an empty array if input array is empty", () => {
    const result = medianCut([], 1);

    expect(result).toHaveLength(0);
  });

  it("should quantize colors based on the largest range channel (R)", () => {
    const colors = [
      new Color(10, 50, 50),
      new Color(20, 50, 50),
      new Color(200, 50, 50),
      new Color(210, 50, 50),
    ];
    // Depth 1 -> 2 colors
    const result = medianCut(colors, 1);

    expect(result).toHaveLength(2);
    // Group 1 average: (10+20)/2 = 15
    // Group 2 average: (200+210)/2 = 205
    expect(result.map((c) => c.r).sort((a, b) => a - b)).toEqual([15, 205]);
    expect(result[0]?.g).toBe(50);
    expect(result[0]?.b).toBe(50);
    expect(result[1]?.g).toBe(50);
    expect(result[1]?.b).toBe(50);
  });

  it("should quantize colors based on the largest range channel (G)", () => {
    const colors = [
      new Color(50, 10, 50),
      new Color(50, 20, 50),
      new Color(50, 200, 50),
      new Color(50, 210, 50),
    ];
    // Depth 1 -> 2 colors
    const result = medianCut(colors, 1);

    expect(result).toHaveLength(2);
    // Group 1 average: (10+20)/2 = 15
    // Group 2 average: (200+210)/2 = 205
    expect(result.map((c) => c.g).sort((a, b) => a - b)).toEqual([15, 205]);
  });

  it("should quantize colors based on the largest range channel (B)", () => {
    const colors = [
      new Color(50, 50, 10),
      new Color(50, 50, 20),
      new Color(50, 50, 200),
      new Color(50, 50, 210),
    ];
    // Depth 1 -> 2 colors
    const result = medianCut(colors, 1);

    expect(result).toHaveLength(2);
    // Group 1 average: (10+20)/2 = 15
    // Group 2 average: (200+210)/2 = 205
    expect(result.map((c) => c.b).sort((a, b) => a - b)).toEqual([15, 205]);
  });

  it("should produce 2^depth colors for sufficient input colors", () => {
    const colors = [
      new Color(0, 0, 0),
      new Color(10, 0, 0),
      new Color(0, 10, 0),
      new Color(0, 0, 10),
      new Color(200, 200, 200),
      new Color(210, 200, 200),
      new Color(200, 210, 200),
      new Color(200, 200, 210),
    ];
    const result = medianCut(colors, 3); // 2^3 = 8 colors

    expect(result).toHaveLength(8);
    // Check if colors are distinct averages (simplistic check)

    const uniqueHex = new Set(result.map((c) => `${c.r}-${c.g}-${c.b}`));

    // In this specific case, with depth 3 and 8 initial distinct colors,
    // each color should end up in its own bucket after sorting/splitting.
    expect(uniqueHex.size).toBe(8);
  });

  it("should handle cases where input colors are fewer than 2^depth", () => {
    const colors = [
      new Color(10, 20, 30),
      new Color(40, 50, 60),
      new Color(70, 80, 90),
    ];
    const result = medianCut(colors, 3); // Request 8 colors, but only 3 input

    // It will recursively split until depth 0 or single colors remain.
    // The exact number of output colors depends on the splitting path.
    // It should be <= number of input colors.
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result.length).toBeGreaterThan(0);
  });
});
