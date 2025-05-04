import { describe, it, expect } from "vitest";

import { Color } from "./color";
import { kMeansClustering } from "./kmeans";

describe("kMeansClustering", () => {
  it("should return an empty array if input colors are empty", () => {
    const result = kMeansClustering([], 3);

    expect(result).toEqual([]);
  });

  it("should return the input colors if k is greater or equal to the number of colors", () => {
    const colors = [new Color(10, 20, 30), new Color(40, 50, 60)];
    const result = kMeansClustering(colors, 3);

    expect(result).toHaveLength(2);
    expect(result).toEqual(colors);

    const result2 = kMeansClustering(colors, 2);

    expect(result2).toHaveLength(2);
    expect(result2).toEqual(colors);
  });

  it("should return k clusters for a sufficient number of input colors", () => {
    const colors = [
      new Color(0, 0, 0), // Black
      new Color(10, 10, 10),
      new Color(255, 0, 0), // Red
      new Color(245, 10, 10),
      new Color(0, 255, 0), // Green
      new Color(10, 245, 10),
      new Color(0, 0, 255), // Blue
      new Color(10, 10, 245),
    ];
    const k = 4;
    const result = kMeansClustering(colors, k);

    expect(result).toHaveLength(k);

    // Basic sanity check: ensure counts are aggregated
    result.forEach((centroid) => {
      expect(centroid.count).toBeGreaterThan(0);
    });
  });

  it("should assign counts correctly to the resulting centroids", () => {
    const color1 = new Color(0, 0, 0);
    color1.count = 5; // 5 black pixels
    const color2 = new Color(10, 0, 0);
    color2.count = 2; // 2 near-black pixels
    const color3 = new Color(255, 255, 255);
    color3.count = 8; // 8 white pixels
    const color4 = new Color(245, 255, 255);
    color4.count = 3; // 3 near-white pixels
    const colors = [color1, color2, color3, color4];
    const k = 2;
    const result = kMeansClustering(colors, k, 30); // Increase iterations for stability

    expect(result).toHaveLength(k);

    // Expect one cluster near black, one near white
    const totalCount = colors.reduce((sum, c) => sum + c.count, 0);
    const resultCount = result.reduce((sum, c) => sum + c.count, 0);

    expect(resultCount).toBe(totalCount); // Total count should be preserved

    // Check if clusters are roughly correct (one dark, one light)
    const darkCluster = result.find((c) => c.r < 128);
    const lightCluster = result.find((c) => c.r >= 128);

    expect(darkCluster).toBeDefined();
    expect(lightCluster).toBeDefined();
    expect(darkCluster?.count).toBe(color1.count + color2.count); // Should group dark colors
    expect(lightCluster?.count).toBe(color3.count + color4.count); // Should group light colors
  });

  it("should handle identical input colors", () => {
    const colors = [
      new Color(50, 50, 50),
      new Color(50, 50, 50),
      new Color(50, 50, 50),
    ];
    colors[0]!.count = 2;
    colors[1]!.count = 3;
    colors[2]!.count = 1;

    const k = 1;
    const result = kMeansClustering(colors, k);

    expect(result).toHaveLength(1);
    expect(result[0]?.r).toBe(50);
    expect(result[0]?.g).toBe(50);
    expect(result[0]?.b).toBe(50);
    expect(result[0]?.count).toBe(6);
  });
});
