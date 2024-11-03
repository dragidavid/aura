import { Color } from "./color";

/**
 * Implements the Median Cut algorithm for color quantization.
 * This algorithm recursively divides the color space into boxes,
 * and averages the colors in each box.
 *
 * @param colors - Array of Color objects to process
 * @param depth - Recursion depth (final number of colors will be 2^depth)
 * @returns Array of averaged colors
 */
export function medianCut(colors: Color[], depth: number): Color[] {
  if (depth === 0 || colors.length === 0) {
    return [Color.average(colors)];
  }

  // Find the color channel with the largest range
  const rRange = colors.reduce(
    (range, color) => ({
      min: Math.min(range.min, color.r),
      max: Math.max(range.max, color.r),
    }),
    { min: 255, max: 0 }
  );

  const gRange = colors.reduce(
    (range, color) => ({
      min: Math.min(range.min, color.g),
      max: Math.max(range.max, color.g),
    }),
    { min: 255, max: 0 }
  );

  const bRange = colors.reduce(
    (range, color) => ({
      min: Math.min(range.min, color.b),
      max: Math.max(range.max, color.b),
    }),
    { min: 255, max: 0 }
  );

  const rDiff = rRange.max - rRange.min;
  const gDiff = gRange.max - gRange.min;
  const bDiff = bRange.max - bRange.min;

  // Sort by the channel with largest range
  let sortIndex: keyof Color;
  if (rDiff > gDiff && rDiff > bDiff) sortIndex = "r";
  else if (gDiff > bDiff) sortIndex = "g";
  else sortIndex = "b";

  colors.sort((a, b) => a[sortIndex] - b[sortIndex]);

  // Split colors into two groups and recurse
  const mid = Math.floor(colors.length / 2);
  return [
    ...medianCut(colors.slice(0, mid), depth - 1),
    ...medianCut(colors.slice(mid), depth - 1),
  ];
}
