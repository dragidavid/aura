"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { motion } from "motion/react";

import { Colors } from "@/components/colors";
import { Background } from "@/components/background";

import { cn } from "@/lib/cn";
import { ui } from "@/lib/tunnel";

import type { AuraColor } from "@drgd/aura";

const START_INDEX = 0;
const AUTOPLAY_DELAY = 8000;

export function Carousel({
  images,
  preloadedColors,
}: {
  images: { src: string; base64: string }[];
  preloadedColors: Record<number, AuraColor[]>;
}) {
  const [currentIndex, setCurrentIndex] = useState(START_INDEX);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      startIndex: START_INDEX,
    },
    [
      Fade(),
      Autoplay({
        delay: AUTOPLAY_DELAY,
      }),
    ],
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setCurrentIndex]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (images.length === 0) return null;

  const currentColors = preloadedColors[currentIndex] || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("relative flex size-full overflow-hidden rounded-lg")}
    >
      <ui.In>
        <Background colors={currentColors} />
      </ui.In>

      <div ref={emblaRef} className="flex-1">
        <div className={cn("relative flex h-full touch-pan-y")}>
          {images.map((image, i) => (
            <div
              key={image.src}
              className={cn("relative min-w-0 flex-[0_0_100%] select-none")}
            >
              <Image
                src={image.src}
                alt={`Carousel image ${i + 1}`}
                fill
                priority={i === START_INDEX}
                loading={i === START_INDEX ? "eager" : "lazy"}
                quality={50}
                placeholder="blur"
                blurDataURL={image.base64}
                className={cn("size-full object-cover")}
              />
            </div>
          ))}
        </div>
      </div>

      <Colors colors={currentColors} />

      <button
        onClick={scrollPrev}
        className={cn(
          "absolute top-1/2 left-4 z-10 hidden -translate-y-1/2 rounded-full p-2",
          "border border-white/10 bg-black/20",
          "transition-colors duration-100",
          "hover:bg-white/10",
          "sm:block",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn("size-5", "fill-none stroke-current")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={scrollNext}
        className={cn(
          "absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 rounded-full p-2",
          "border border-white/10 bg-black/20",
          "transition-colors duration-100",
          "hover:bg-white/10",
          "sm:block",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn("size-5", "fill-none stroke-current")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </motion.div>
  );
}
