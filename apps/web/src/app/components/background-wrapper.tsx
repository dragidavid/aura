"use client";

import { extractAura } from "@drgd/aura/client";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { useSetAtom } from "jotai";
import { updateColorsAtom } from "../atoms/colors";

const BackgroundScene = dynamic(() => import("./background-scene"), {
  ssr: false,
  loading: () => null,
});

interface BackgroundWrapperProps {
  imageUrl: string;
}

export default function BackgroundWrapper({
  imageUrl,
}: BackgroundWrapperProps) {
  const { colors, isLoading, error } = extractAura(imageUrl);
  const updateColors = useSetAtom(updateColorsAtom);

  useEffect(() => {
    if (colors && !isLoading && !error) {
      updateColors(colors);
    }
  }, [colors, isLoading, error, updateColors]);

  return (
    <Suspense fallback={null}>
      <BackgroundScene />
    </Suspense>
  );
}
