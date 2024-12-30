import { Color } from "./color";

// Memoized distance calculation to avoid recalculating distances
const memoizedDistance = (color: Color, centroid: Color): number => {
  return (
    Math.pow(color.r - centroid.r, 2) +
    Math.pow(color.g - centroid.g, 2) +
    Math.pow(color.b - centroid.b, 2)
  );
};

/**
 * Implements k-means clustering algorithm with k-means++ initialization.
 * This algorithm finds k representative colors from the input color set.
 *
 * @param colors - Array of Color objects to cluster
 * @param k - Number of clusters (colors) to generate
 * @param maxIterations - Maximum number of iterations to perform
 * @returns Array of k representative colors
 */
export function kMeansClustering(
  colors: Color[],
  k: number,
  maxIterations = 20
): Color[] {
  if (colors.length === 0) return [];
  if (colors.length <= k) return colors;

  // Initialize centroids using k-means++
  const centroids: Color[] = [
    colors[Math.floor(Math.random() * colors.length)]!,
  ];

  while (centroids.length < k) {
    // Calculate distances to nearest centroid for each color
    const distances = colors.map((color) => {
      return Math.min(
        ...centroids.map(
          (centroid) =>
            Math.pow(color.r - centroid.r, 2) +
            Math.pow(color.g - centroid.g, 2) +
            Math.pow(color.b - centroid.b, 2)
        )
      );
    });

    // Choose next centroid with probability proportional to distance squared
    const sum = distances.reduce((a, b) => a + b, 0);
    const random = Math.random() * sum;

    let acc = 0;
    for (let i = 0; i < distances.length; i++) {
      acc += distances[i] ?? 0;
      if (acc >= random) {
        centroids.push(colors[i]!);
        break;
      }
    }
  }

  let currentCentroids = [...centroids];

  // Cache previous assignments to avoid recalculating distances
  let previousAssignments = new Map<string, number>();

  // Iterate until convergence or max iterations
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const clusters: Color[][] = Array.from({ length: k }, () => []);
    const currentAssignments = new Map<string, number>();

    // Assign colors to nearest centroid with caching
    for (const color of colors) {
      const colorKey = `${color.r},${color.g},${color.b}`;
      let nearestIndex = previousAssignments.get(colorKey);

      if (nearestIndex === undefined) {
        let minDistance = Infinity;
        nearestIndex = 0;

        currentCentroids.forEach((centroid, i) => {
          const distance = memoizedDistance(color, centroid);

          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
          }
        });
      }

      currentAssignments.set(colorKey, nearestIndex);
      clusters[nearestIndex]?.push(color);
    }

    previousAssignments = currentAssignments;

    // Calculate new centroids
    const newCentroids = clusters.map((cluster) => {
      if (cluster.length === 0) return currentCentroids[0];
      const avg = Color.average(cluster);
      avg.count = cluster.reduce((sum, color) => sum + color.count, 0);
      return avg;
    });

    // Check for convergence
    const hasConverged = currentCentroids.every((centroid, i) => {
      const newCentroid = newCentroids[i];
      return (
        centroid.r === newCentroid?.r &&
        centroid.g === newCentroid?.g &&
        centroid.b === newCentroid?.b
      );
    });

    // If centroids have converged, return the new centroids
    if (hasConverged) {
      return newCentroids.filter((centroid) => centroid !== undefined);
    }

    // Otherwise, update centroids for the next iteration
    currentCentroids = newCentroids.filter(
      (centroid) => centroid !== undefined
    );
  }

  return currentCentroids;
}
