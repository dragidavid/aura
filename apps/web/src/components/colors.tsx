"use client";

import { useMemo } from "react";
import { useTransition, animated } from "@react-spring/web";

import { cn } from "@/lib/cn";

// TODO: change this once the export is fixed in the package
import type { AuraColor } from "@drgd/aura/client";

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
    },
    enter: (item) => ({
      opacity: 1,
      delay: item.position * 50,
    }),
    leave: (item) => ({
      opacity: 0,
      delay: item.position * 25,
    }),
    keys: (item) => `${item.position}-${item.hex}`,
  });

  return (
    <div className={cn("absolute bottom-full w-full p-3", "saturate-150")}>
      <div className={cn("relative flex h-8 justify-between", "sm:h-10")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`color-${index}`} className={cn("relative w-8", "sm:w-10")}>
            {transitions((style, item) => {
              if (item.position !== index) return null;

              return (
                <animated.div
                  key={item.hex}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "border border-dashed border-white/60 shadow-xl shadow-black/60 backdrop-blur-sm",
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
