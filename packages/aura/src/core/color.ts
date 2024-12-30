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

    const avg = colors.reduce(
      (acc, color) => {
        acc.r += color.r * color.count;
        acc.g += color.g * color.count;
        acc.b += color.b * color.count;
        acc.count += color.count;
        return acc;
      },
      new Color(0, 0, 0)
    );

    return new Color(
      Math.round(avg.r / avg.count),
      Math.round(avg.g / avg.count),
      Math.round(avg.b / avg.count),
      avg.count
    );
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
