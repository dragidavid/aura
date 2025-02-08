"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, useMotionValue, useAnimation } from "motion/react";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const controls = useAnimation();
  const x = useMotionValue(0);

  const { isMobile } = useIsMobile();

  const imageWidth = 100;
  const totalWidth = imageWidth * images.length;

  const updatePosition = useCallback(
    (index: number) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;

      controls.start({
        x: -index * containerWidth,
        transition: { type: "tween", ease: "easeOut", duration: 0.2 },
      });
    },
    [controls],
  );

  const handleImageChange = useCallback(
    (dir: "next" | "previous") => {
      if (dir === "next") {
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } else {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }
    },
    [currentIndex, images.length],
  );

  const handleDragEnd = useCallback(
    (
      _: MouseEvent | TouchEvent | PointerEvent,
      info: { offset: { x: number }; velocity: { x: number } },
    ) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const moveThreshold = containerWidth * 0.15;
      const velocityThreshold = 200;

      const offsetX = Math.abs(info.offset.x);
      const velocityX = Math.abs(info.velocity.x);
      const direction = info.offset.x < 0 ? 1 : -1;

      const shouldSwipe =
        (offsetX > moveThreshold || velocityX > velocityThreshold) &&
        ((direction > 0 && currentIndex < images.length - 1) ||
          (direction < 0 && currentIndex > 0));

      if (shouldSwipe) {
        setCurrentIndex((prev) => prev + direction);
      } else {
        updatePosition(currentIndex);
      }
    },
    [currentIndex, images.length, updatePosition],
  );

  const motionProps = useMemo(
    () => ({
      drag: isMobile ? ("x" as const) : false,
      dragConstraints: containerRef,
      dragMomentum: true,
      dragDirectionLock: true,
      dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
      onDragStart: () => setIsDragging(true),
      onDragEnd: (
        e: MouseEvent | TouchEvent | PointerEvent,
        info: { offset: { x: number }; velocity: { x: number } },
      ) => {
        setIsDragging(false);
        handleDragEnd(e, info);
      },
      animate: controls,
      initial: false,
      style: {
        width: `${totalWidth}%`,
        x,
      },
      className: cn(
        "absolute flex h-full",
        "will-change-transform",
        isMobile ? "touch-pan-x" : "touch-none",
      ),
    }),
    [controls, handleDragEnd, isMobile, totalWidth, x],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updatePosition(currentIndex);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentIndex, updatePosition]);

  useEffect(() => {
    updatePosition(currentIndex);
  }, [currentIndex, updatePosition]);

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
    <div ref={containerRef} className={cn("relative size-full")}>
      <Background colors={preloadedColors[currentIndex]} />

      <Colors colors={preloadedColors[currentIndex]} />

      <motion.div {...motionProps}>
        {images.map((image, i) => (
          <div
            key={image.src}
            className={cn(
              "relative h-full select-none",
              "transition-all duration-200",
              i !== currentIndex && "brightness-50 saturate-0",
            )}
            style={{ width: `${imageWidth}%` }}
          >
            <Image
              src={image.src}
              alt={`Carousel image ${i + 1}`}
              fill
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={30}
              placeholder="blur"
              blurDataURL={image.base64}
              className={cn("pointer-events-none object-cover")}
            />

            <div
              className={cn(
                "absolute inset-0",
                "bg-gradient-to-t from-black/40 to-transparent",
              )}
            />
          </div>
        ))}
      </motion.div>

      {currentIndex > 0 && (
        <button
          onClick={() => handleImageChange("previous")}
          className={cn(
            "absolute top-1/2 left-3 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-xl",
            "border border-white/20 bg-black/60 shadow-xl shadow-black/20 backdrop-blur-lg",
            "hover:border-white",
            isDragging && "pointer-events-none",
          )}
          aria-label="Previous image"
        >
          ←
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={() => handleImageChange("next")}
          className={cn(
            "absolute top-1/2 right-3 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-xl",
            "border border-white/20 bg-black/60 shadow-xl shadow-black/20 backdrop-blur-lg",
            "hover:border-white",
            isDragging && "pointer-events-none",
          )}
          aria-label="Next image"
        >
          →
        </button>
      )}
    </div>
  );
}
