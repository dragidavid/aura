"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSpring, animated } from "@react-spring/web";

import { cn } from "@/lib/cn";

const Scene = dynamic(
  () => import("@/components/background/scene").then((mod) => mod.Scene),
  {
    ssr: false,
    loading: () => null,
  },
);

export function Background() {
  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { duration: 4000 },
  });

  return (
    <Suspense fallback={null}>
      <animated.div
        style={fadeIn}
        className={cn("fixed inset-0 -z-10", "pointer-events-none")}
      >
        <Scene />
      </animated.div>
    </Suspense>
  );
}
