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
        "flex flex-col rounded-lg font-mono text-sm",
        "border border-white/20",
      )}
    >
      <div
        className={cn(
          "flex justify-between gap-3 p-3",
          "border-b border-white/20 bg-white/5",
        )}
      >
        <button
          onClick={getNewImage}
          className={cn(
            "rounded-full px-4 py-2",
            "border border-dashed border-white/20 bg-white/10",
            "hover:border-white",
          )}
        >
          Refresh
        </button>

        <div className={cn("flex gap-3")}>
          {COLOR_OPTIONS.map((num) => (
            <button
              key={num}
              onClick={() => setPaletteSize(num)}
              className={cn(
                "size-[38px] rounded-full",
                "border border-dashed border-white/20 bg-white/10",
                "hover:border-white",
                paletteSize === num && "border-white",
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("flex flex-col gap-3 p-3", "sm:flex-row")}>
        <div className={cn("relative min-h-32 flex-1", "sm:aspect-square")}>
          <AnimatePresence mode="wait">
            {imageUrl && (
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                transition={{ duration: 0.3 }}
                className={cn("absolute inset-0")}
              >
                {error ? (
                  <div
                    className={cn(
                      "flex size-full items-center justify-center rounded-lg",
                      "bg-white/5",
                    )}
                  >
                    ?
                  </div>
                ) : (
                  <Image
                    src={imageUrl}
                    alt="Sample"
                    fill
                    className={cn("rounded-lg object-cover")}
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
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
                "flex h-full min-h-12 items-center justify-center font-medium",
                "text-red-500",
              )}
            >
              <span>Error</span>
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
      <div className={cn("grid grid-cols-2 gap-3")}>
        {Array.from({ length: colors.length }).map((_, index) => (
          <div key={`slot-${index}`} className={cn("relative h-9")}>
            <AnimatePresence>
              {items.map((item) => {
                if (item.position !== index) return null;

                return (
                  <motion.div
                    key={item.hex}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    transition={{ delay: item.position * 0.025 }}
                    className={cn(
                      "absolute inset-0 flex items-center justify-between rounded-lg px-3",
                      "text-auto-contrast",
                    )}
                    style={{
                      backgroundColor: item.hex,
                      ["--red" as string]: parseInt(item.hex.slice(1, 3), 16),
                      ["--green" as string]: parseInt(item.hex.slice(3, 5), 16),
                      ["--blue" as string]: parseInt(item.hex.slice(5, 7), 16),
                    }}
                  >
                    <span>{item.hex}</span>
                    <span>{Math.round(item.weight * 100)}%</span>
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
