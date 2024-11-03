import { Color } from "./color";

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

  // Iterate until convergence or max iterations
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const clusters: Color[][] = Array.from({ length: k }, () => []);

    // Assign colors to nearest centroid
    for (const color of colors) {
      let minDistance = Infinity;
      let nearestIndex = 0;

      currentCentroids.forEach((centroid, i) => {
        const distance =
          Math.pow(color.r - centroid.r, 2) +
          Math.pow(color.g - centroid.g, 2) +
          Math.pow(color.b - centroid.b, 2);

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      });

      clusters[nearestIndex]?.push(color);
    }

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

    if (hasConverged) {
      return newCentroids.filter((centroid) => centroid !== undefined);
    }

    currentCentroids = newCentroids.filter(
      (centroid) => centroid !== undefined
    );
  }

  return currentCentroids;
}
