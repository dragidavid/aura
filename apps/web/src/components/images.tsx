"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";

import { Colors } from "@/components/colors";
import { Background } from "@/components/background";

import { useIsMobile } from "@/hooks/use-is-mobile";

import { cn } from "@/lib/cn";

import type { AuraColor } from "@drgd/aura";

export function Images({
  images,
  preloadedColors,
}: {
  images: { src: string; base64: string }[];
  preloadedColors: Record<number, AuraColor[]>;
}) {
  const { isMobile } = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    axis: "x",
    skipSnaps: false,
    dragFree: false,
    align: "center",
    containScroll: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

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

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = document.createElement("img");
      img.src = src;
    };

    if (currentIndex > 0) {
      preloadImage(images[currentIndex - 1].src);
    }
    if (currentIndex < images.length - 1) {
      preloadImage(images[currentIndex + 1].src);
    }
  }, [currentIndex, images]);

  if (images.length === 0) return null;

  return (
    <div className={cn("relative size-full")}>
      <Background colors={preloadedColors[currentIndex]} />
      <Colors colors={preloadedColors[currentIndex]} />

      <div ref={emblaRef} className={cn("size-full overflow-visible")}>
        <div className={cn("flex h-full touch-pan-y")}>
          {images.map((image, i) => (
            <div
              key={image.src}
              className={cn(
                "relative h-full w-full shrink-0 px-4 select-none",
                "transition-all duration-500 ease-out",
                i !== currentIndex && "scale-[0.85] brightness-50 saturate-0",
              )}
            >
              <Image
                src={image.src}
                alt={`Carousel image ${i + 1}`}
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                sizes="100vw"
                quality={30}
                placeholder="blur"
                blurDataURL={image.base64}
                className={cn(
                  "pointer-events-none object-cover",
                  "transition-transform duration-500 ease-out",
                )}
              />
              <div
                className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-t from-black/40 to-transparent",
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={scrollPrev}
          className={cn(
            "absolute top-1/2 left-6 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-xl",
            "border border-white/20 bg-black/60 shadow-xl shadow-black/20 backdrop-blur-lg",
            "transition-colors hover:border-white",
          )}
          aria-label="Previous image"
        >
          ←
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={scrollNext}
          className={cn(
            "absolute top-1/2 right-6 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-xl",
            "border border-white/20 bg-black/60 shadow-xl shadow-black/20 backdrop-blur-lg",
            "transition-colors hover:border-white",
          )}
          aria-label="Next image"
        >
          →
        </button>
      )}
    </div>
  );
}
