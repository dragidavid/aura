export function getShuffledArray(max: number): number[] {
  const nums = Array.from({ length: max }, (_, index) => index + 1);

  for (let currentIndex = nums.length - 1; currentIndex > 0; currentIndex--) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

    [nums[currentIndex], nums[randomIndex]] = [
      nums[randomIndex],
      nums[currentIndex],
    ];
  }

  return nums;
}
