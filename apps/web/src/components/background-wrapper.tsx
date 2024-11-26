"use client";

import { extractAura } from "@drgd/aura/client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSetAtom } from "jotai";
import { updateColorsAtom } from "@/atoms/colors";
import { useSpring, animated } from "@react-spring/web";

const BackgroundScene = dynamic(() => import("./background-scene"), {
  ssr: false,
  loading: () => null,
});

export default function BackgroundWrapper({ imageUrl }: { imageUrl: string }) {
  const { colors, isLoading, error } = extractAura(imageUrl);
  const updateColors = useSetAtom(updateColorsAtom);

  if (colors && !isLoading && !error) {
    updateColors(colors);
  }

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 4000 },
  });

  return (
    <Suspense fallback={null}>
      <animated.div
        style={fadeIn}
        className="pointer-events-none fixed inset-0 -z-20"
      >
        <BackgroundScene />
      </animated.div>

      <div className="backdrop-saturate-250 fixed inset-0 -z-10 backdrop-blur-[50px] backdrop-brightness-150" />
    </Suspense>
  );
}
