"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { extractColors } from "aura/aura";
import styles from "./page.module.css";

export default function Home() {
  const [imageId, setImageId] = useState(() =>
    Math.floor(Math.random() * 1000)
  );
  const [colors, setColors] = useState<
    Array<{ rgb: string; hex: string; weight: number }>
  >([]);

  const getImageUrl = (id: number) =>
    `https://picsum.photos/seed/${id}/400/400`;

  const refreshImage = useCallback(async () => {
    const newId = Math.floor(Math.random() * 1000);
    setImageId(newId);

    try {
      const newColors = await extractColors(getImageUrl(newId));
      setColors(newColors);
    } catch (error) {
      console.error("Error extracting colors:", error);
    }
  }, []);

  // Initial color extraction
  useState(() => {
    extractColors(getImageUrl(imageId)).then(setColors).catch(console.error);
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className="relative w-64 h-64 mb-4">
          <Image
            src={getImageUrl(imageId)}
            alt="Random image"
            width={400}
            height={400}
            className="rounded-lg"
          />
        </div>
        <button
          onClick={refreshImage}
          className="px-4 py-2 mb-4 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Refresh Image
        </button>
        <div className="flex gap-4 mt-4">
          {colors.map((color, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                style={{
                  height: "30px",
                  width: "30px",
                  backgroundColor: color.hex,
                }}
                title={`${color.hex} (${Math.round(color.weight * 100)}%)`}
              />
              <span className="text-xs mt-1">{color.hex}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
