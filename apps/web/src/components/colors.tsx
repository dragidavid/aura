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
    <div className={cn("absolute bottom-full w-full p-3", "saturate-150")}>
      <div className={cn("relative flex h-9 justify-between", "sm:h-11")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`color-${index}`} className={cn("relative w-9", "sm:w-11")}>
            {transitions((style, item) => {
              if (item.position !== index) return null;

              return (
                <animated.div
                  key={item.hex}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "border border-white/40 shadow-xl shadow-black/50",
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
