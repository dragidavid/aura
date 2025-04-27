"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

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

  return (
    <motion.div
      className={cn("absolute bottom-3 z-10 w-full")}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className={cn("relative flex h-8 justify-center gap-2")}>
        {items.map((item, index) => (
          <div key={`color-${index}`} className={cn("relative w-8")}>
            <AnimatePresence>
              {item && (
                <motion.div
                  key={`${item.position}-${item.hex}`}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "border border-white/10 shadow-lg brightness-125 saturate-150",
                  )}
                  style={{ backgroundColor: item.hex }}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: 0.1,
                      ease: "easeOut",
                      duration: 0.2,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.75,
                    transition: {
                      ease: "easeIn",
                      duration: 0.2,
                    },
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
