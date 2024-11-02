"use client";

import { extractColors } from "aura";
import { useEffect, useState } from "react";

export default function Colors({ imageUrl }: { imageUrl: string }) {
  const [colors, setColors] = useState<Array<{ hex: string }>>([]);

  useEffect(() => {
    const getColors = async () => {
      try {
        const extractedColors = await extractColors(imageUrl);
        setColors(extractedColors);
      } catch (error) {
        console.error("Failed to extract colors:", error);
      }
    };

    getColors();
  }, [imageUrl]);

  console.log(colors);

  return (
    <div className="flex gap-2 justify-evenly">
      {colors.map((color) => (
        <div
          key={color.hex}
          className="w-10 h-10 rounded-lg"
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}
