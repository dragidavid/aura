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

export interface ColorInfo {
  hex: string;
  weight: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
