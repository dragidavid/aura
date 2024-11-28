"use client";

import { useEffect } from "react";
import { colorsAtom } from "@/atoms/colors";
import { extractAura } from "@drgd/aura/client";
import { useSetAtom, useAtomValue } from "jotai";

export default function Client({ imageUrl }: { imageUrl: string }) {
  const { colors, isLoading, error } = extractAura(imageUrl);
  const setColors = useSetAtom(colorsAtom);
  const currentColors = useAtomValue(colorsAtom);

  useEffect(() => {
    if (colors && !isLoading && !error) {
      setColors(colors);
    }
  }, [colors, isLoading, error, setColors]);

  if (error) {
    return <div>Error while getting the colors</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-evenly gap-2">
      {currentColors.map((color) => (
        <div
          key={color.hex}
          className="h-10 w-10 rounded-lg"
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}
