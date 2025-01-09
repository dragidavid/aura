"use client";

import { useMemo } from "react";
import { useTransition, animated } from "@react-spring/web";

import { cn } from "@/lib/cn";

import type { AuraColor } from "@drgd/aura";

export function Colors({ colors }: { colors: AuraColor[] }) {
  const items = useMemo(
    () =>
      colors.map((color, index) => ({
        hex: color.hex,
        position: index,
      })),
    [colors],
  );

  const transitions = useTransition(items, {
    from: {
      opacity: 0,
      scale: 0.8,
    },
    enter: (item) => ({
      opacity: 1,
      scale: 1,
      delay: item.position * 50,
    }),
    leave: (item) => ({
      opacity: 0,
      scale: 0.8,
      delay: item.position * 25,
    }),
    keys: (item) => `${item.position}-${item.hex}`,
  });

  return (
    <div className={cn("absolute bottom-full w-full p-3")}>
      <div className={cn("relative flex h-3 justify-between gap-3")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`color-${index}`} className={cn("relative w-full")}>
            {transitions((style, item) => {
              if (item.position !== index) return null;

              return (
                <animated.div
                  key={item.hex}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "shadow-lg shadow-black/30 brightness-150 saturate-150",
                  )}
                  style={{
                    ...style,
                    backgroundColor: item.hex,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
