"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useSetAtom } from "jotai";
import { extractAura } from "@drgd/aura/client";
import { useTransition, animated } from "@react-spring/web";

import { colorsAtom } from "@/atoms/colors";

import { cn } from "@/lib/cn";

export function Client({ imageUrl }: { imageUrl: string }) {
  const { colors, isLoading, error } = extractAura(imageUrl);

  const setColors = useSetAtom(colorsAtom);

  const updateColors = useCallback(() => {
    if (colors && !isLoading && !error) {
      setColors(colors);
    }
  }, [colors, isLoading, error, setColors]);

  useEffect(() => {
    const timeoutId = setTimeout(updateColors, 0);
    return () => clearTimeout(timeoutId);
  }, [updateColors]);

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
    <div className={cn("relative flex w-full flex-col justify-around")}>
      <span className="py-2">client</span>

      <div className={cn("relative flex h-8 gap-px")}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`client-color-${index}`}
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
