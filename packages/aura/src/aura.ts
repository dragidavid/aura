class Color {
  r: number;
  g: number;
  b: number;
  count: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.count = 1;
  }

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

    avg.r = Math.round(avg.r / avg.count);
    avg.g = Math.round(avg.g / avg.count);
    avg.b = Math.round(avg.b / avg.count);

    return avg;
  }
}

interface ColorInfo {
  hex: string;
  weight: number;
}

function medianCut(colors: Color[], depth: number): Color[] {
  if (depth === 0 || colors.length === 0) {
    return [Color.average(colors)];
  }

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

  let sortIndex: keyof Color;
  if (rDiff > gDiff && rDiff > bDiff) sortIndex = "r";
  else if (gDiff > bDiff) sortIndex = "g";
  else sortIndex = "b";

  colors.sort((a, b) => a[sortIndex] - b[sortIndex]);

  const mid = Math.floor(colors.length / 2);
  return [
    ...medianCut(colors.slice(0, mid), depth - 1),
    ...medianCut(colors.slice(mid), depth - 1),
  ];
}

function kMeansClustering(
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

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function extractColors(
  imageUrl: string,
  numColors: number = 6
): Promise<ColorInfo[]> {
  if (typeof window === "undefined") {
    throw new Error("This function must be run in a browser environment");
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Use full resolution
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const colorMap = new Map<string, Color>();

  // Process every pixel
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Skip fully transparent pixels
    if (a === 0) continue;

    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, new Color(r!, g!, b!));
    }
  }

  const colors = Array.from(colorMap.values());
  const totalPixels = canvas.width * canvas.height;

  // Use hybrid approach: Median Cut followed by K-means
  const medianCutColors = medianCut(colors, 3); // 2^3 = 8 initial colors
  const kMeansColors = kMeansClustering(medianCutColors, numColors);

  return kMeansColors
    .map((color) => ({
      hex: rgbToHex(color.r, color.g, color.b),
      weight: color.count / totalPixels,
    }))
    .sort((a, b) => b.weight - a.weight);
}

export { Color };
export type { ColorInfo };
