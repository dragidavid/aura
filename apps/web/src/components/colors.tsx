"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/cn";

import type { AuraColor } from "@drgd/aura";

export function Colors({
  colors,
  direction = 1,
}: {
  colors: AuraColor[];
  direction?: number;
}) {
  const items = useMemo(
    () =>
      colors.map((color, index) => ({
        hex: color.hex,
        position: index,
      })),
    [colors],
  );

  const delayStep = 0.05;
  const exitDelayStep = 0.025;

  return (
    <motion.div
      className={cn("absolute bottom-3 z-10 w-full", "sm:bottom-8")}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className={cn("relative flex h-8 justify-center gap-2")}>
        {Array.from({ length: 6 }).map((_, index) => {
          const item = items.find((item) => item.position === index);
          const order = direction === -1 ? 5 - index : index;

          return (
            <div key={`color-${index}`} className={cn("relative w-8")}>
              <AnimatePresence>
                {item && (
                  <motion.div
                    key={`${item.position}-${item.hex}`}
                    className={cn(
                      "absolute inset-0 rounded-full",
                      "border border-white/20 shadow-lg brightness-125 saturate-150",
                    )}
                    style={{ backgroundColor: item.hex }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delay: order * delayStep,
                        ease: "easeOut",
                        duration: 0.3,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: {
                        delay: order * exitDelayStep,
                        ease: "easeIn",
                        duration: 0.2,
                      },
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
