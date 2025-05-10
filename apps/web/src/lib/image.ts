export function getRandomImages(count: number, max: number): string[] {
  if (count > max) {
    throw new Error(
      `[@drgd/aura] - Requested count exceeds total available images.`,
    );
  }

  if (count <= 0) {
    return [];
  }

  const nums = new Set<number>();

  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * max) + 1);
  }

  return Array.from(nums, (num) => `/assets/${num}.webp`);
}
