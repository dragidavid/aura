/**
 * Represents a color with RGB values and a count of pixels.
 *
 * @param r - The red component of the color (0-255)
 * @param g - The green component of the color (0-255)
 * @param b - The blue component of the color (0-255)
 * @param count - The number of pixels that have this color (default is 1)
 */
export class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public count: number = 1
  ) {}

  static average(colors: Color[]): Color {
    if (colors.length === 0) {
      return new Color(0, 0, 0);
    }

    let totalWeight = 0;
    const weightedSum = {
      r: 0,
      g: 0,
      b: 0,
    };

    for (const color of colors) {
      weightedSum.r += color.r * color.count;
      weightedSum.g += color.g * color.count;
      weightedSum.b += color.b * color.count;
      totalWeight += color.count;
    }

    // Avoid division by zero if totalWeight is somehow 0 (e.g., all input colors had count 0)
    if (totalWeight === 0) {
      // Return average of non-weighted colors or black as fallback
      if (colors.length > 0) {
        const simpleAvgR =
          colors.reduce((sum, c) => sum + c.r, 0) / colors.length;
        const simpleAvgG =
          colors.reduce((sum, c) => sum + c.g, 0) / colors.length;
        const simpleAvgB =
          colors.reduce((sum, c) => sum + c.b, 0) / colors.length;

        return new Color(
          Math.round(simpleAvgR),
          Math.round(simpleAvgG),
          Math.round(simpleAvgB)
        );
      }

      return new Color(0, 0, 0);
    }

    // Calculate the average R, G, B values
    const avgR = Math.round(weightedSum.r / totalWeight);
    const avgG = Math.round(weightedSum.g / totalWeight);
    const avgB = Math.round(weightedSum.b / totalWeight);

    // The resulting average color conceptually represents a single color point
    return new Color(avgR, avgG, avgB, 1);
  }
}

/**
 * Converts an RGB color to a hexadecimal string.
 *
 * @param r - The red component of the color (0-255)
 * @param g - The green component of the color (0-255)
 * @param b - The blue component of the color (0-255)
 * @returns The hexadecimal representation of the color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
