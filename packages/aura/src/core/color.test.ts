import { describe, it, expect } from "vitest";

import { Color, rgbToHex } from "./color";

describe("Color Utilities", () => {
  describe("rgbToHex", () => {
    it("should convert RGB values to a hex string", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
      expect(rgbToHex(16, 32, 64)).toBe("#102040");
      expect(rgbToHex(240, 248, 255)).toBe("#f0f8ff");
    });

    it("should handle boundary values", () => {
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
    });
  });

  describe("Color class", () => {
    it("should correctly initialize with r, g, b values", () => {
      const color = new Color(10, 20, 30);

      expect(color.r).toBe(10);
      expect(color.g).toBe(20);
      expect(color.b).toBe(30);
      expect(color.count).toBe(1);
    });

    describe("average", () => {
      it("should return a Color representing the average of an array of colors", () => {
        const colors = [
          new Color(100, 0, 0), // count: 1
          new Color(0, 100, 0), // count: 1
          new Color(0, 0, 100), // count: 1
        ];
        const avgColor = Color.average(colors);

        // Average of (100,0,0), (0,100,0), (0,0,100) is (33.33..., 33.33..., 33.33...)
        // which rounds to (33, 33, 33)
        expect(avgColor.r).toBe(33);
        expect(avgColor.g).toBe(33);
        expect(avgColor.b).toBe(33);
        expect(avgColor.count).toBe(1); // Average resets count
      });

      it("should handle weighted averages based on color counts", () => {
        const color1 = new Color(200, 0, 0);
        color1.count = 3; // Weight 3
        const color2 = new Color(0, 100, 0);
        color2.count = 1; // Weight 1

        const colors = [color1, color2];
        const avgColor = Color.average(colors);

        // Expected: (200*3 + 0*1) / 4 = 150
        // Expected: (0*3 + 100*1) / 4 = 25
        // Expected: (0*3 + 0*1) / 4 = 0
        expect(avgColor.r).toBe(150);
        expect(avgColor.g).toBe(25);
        expect(avgColor.b).toBe(0);
        expect(avgColor.count).toBe(1);
      });

      it("should return black (0,0,0) for an empty array", () => {
        const avgColor = Color.average([]);

        expect(avgColor.r).toBe(0);
        expect(avgColor.g).toBe(0);
        expect(avgColor.b).toBe(0);
        expect(avgColor.count).toBe(1);
      });

      it("should return the color itself if the array contains only one color", () => {
        const color = new Color(50, 60, 70);
        color.count = 5;
        const avgColor = Color.average([color]);

        expect(avgColor.r).toBe(50);
        expect(avgColor.g).toBe(60);
        expect(avgColor.b).toBe(70);
        expect(avgColor.count).toBe(1);
      });
    });
  });
});
