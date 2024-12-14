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
    <div
      className={cn(
        "absolute bottom-[calc(100%+1px)] flex w-full flex-col text-xs uppercase",
        "border-t border-dashed border-fuchsia-200/20 saturate-150",
      )}
    >
      <div className={cn("relative flex h-8", "bg-black")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`color-${index}`}
            className={cn("relative w-full")}
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            {transitions((style, item) => {
              if (item.position !== index) return null;
              return (
                <animated.div
                  key={item.hex}
                  style={{
                    ...style,
                    backgroundColor: item.hex,
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    willChange: "opacity",
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
