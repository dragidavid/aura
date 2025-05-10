"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useAura } from "@drgd/aura/client";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/cn";

import type { AuraColor } from "@drgd/aura";

const COLOR_OPTIONS = [1, 6, 12];
const INITIAL_IMAGE = "https://picsum.photos/seed/1/400";

export function Demo() {
  const [imageUrl, setImageUrl] = useState(INITIAL_IMAGE);
  const [paletteSize, setPaletteSize] = useState(COLOR_OPTIONS[1]);

  const { colors, isLoading, error } = useAura(imageUrl, {
    paletteSize,
  });

  const getNewImage = () => {
    const randomSeed = Math.floor(Math.random() * 1000);

    setImageUrl(`https://picsum.photos/seed/${randomSeed}/400`);
  };

  return (
    <div
      className={cn(
        "mt-5 flex flex-col gap-3 overflow-hidden rounded-xl p-3 text-sm",
        "border border-white/10 text-white",
      )}
    >
      <div className={cn("flex justify-between gap-3")}>
        <button
          onClick={getNewImage}
          aria-label="Get new image"
          className={cn(
            "rounded-full px-6 py-2 font-serif font-medium tracking-tight",
            "transition-all duration-100",
            "border border-white",
            "hover:cursor-pointer hover:bg-white/20",
          )}
        >
          new image
        </button>

        <div className={cn("flex gap-3")}>
          {COLOR_OPTIONS.map((num) => (
            <button
              key={num}
              onClick={() => setPaletteSize(num)}
              aria-label={`Set palette size to ${num}`}
              className={cn(
                "size-[38px] rounded-full font-serif font-medium tracking-tight",
                "transition-all duration-100",
                "border border-white",
                "hover:cursor-pointer hover:bg-white/20",
                paletteSize === num && "bg-white/20",
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("flex flex-col gap-2", "sm:flex-row")}>
        <div className={cn("relative min-h-32 flex-1", "sm:aspect-square")}>
          <AnimatePresence mode="wait">
            {imageUrl && (
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                transition={{ duration: 0.2 }}
                className={cn("absolute inset-0")}
              >
                {error ? (
                  <div
                    className={cn(
                      "flex size-full items-center justify-center rounded-xl text-2xl",
                      "bg-white/5",
                    )}
                  >
                    <span>×</span>
                  </div>
                ) : (
                  <Image
                    src={imageUrl}
                    alt="Sample"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    quality={50}
                    className={cn("rounded-xl object-cover")}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-1">
          {error ? (
            <div
              className={cn(
                "grid h-full min-h-12 place-items-center font-serif font-medium tracking-tight",
                "text-red-500",
              )}
            >
              <span>error getting colors</span>
            </div>
          ) : (
            <Colors colors={colors} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}

function Colors({
  colors,
  isLoading,
}: {
  colors: AuraColor[];
  isLoading: boolean;
}) {
  const items = useMemo(
    () =>
      colors.map((color, index) => ({
        hex: color.hex,
        position: index,
        weight: color.weight,
      })),
    [colors],
  );

  return (
    <div className="relative">
      <div className={cn("grid grid-cols-2 gap-2")}>
        {Array.from({ length: colors.length }).map((_, index) => (
          <div key={`slot-${index}`} className={cn("relative h-8")}>
            <AnimatePresence>
              {items.map((item) => {
                if (item.position !== index) return null;

                return (
                  <motion.div
                    key={item.hex}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ delay: item.position * 0.025 }}
                    className={cn(
                      "absolute inset-0 flex items-center justify-between rounded-full pl-[3px] font-mono text-xs font-medium uppercase",
                      "saturate-150",
                    )}
                    style={{
                      backgroundColor: `color-mix(in oklab, ${item.hex} 20%, transparent)`,
                      border: `1px solid color-mix(in oklab, ${item.hex} 20%, transparent)`,
                    }}
                  >
                    <div
                      className={cn("size-6 rounded-full")}
                      style={{ backgroundColor: item.hex }}
                    />

                    <span>{item.hex}</span>
                    <span className={cn("mr-2.5", "text-white/60")}>
                      {Math.round(item.weight * 100)}%
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 1 : 0 }}
        transition={{ tension: 280, friction: 60 }}
        style={{ pointerEvents: isLoading ? "auto" : "none" }}
        className={cn(
          "absolute inset-0",
          "backdrop-brightness-50 backdrop-saturate-0",
        )}
      />
    </div>
  );
}
