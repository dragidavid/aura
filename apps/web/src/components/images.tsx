"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

import { Colors } from "@/components/colors";
import { Background } from "@/components/background";

import { useIsMobile } from "@/hooks/use-is-mobile";

import { cn } from "@/lib/cn";

// TODO: change this once the export is fixed in the package
import type { AuraColor } from "@drgd/aura/client";

export function Images({
  images,
  preloadedColors,
}: {
  images: string[];
  preloadedColors: Record<number, AuraColor[]>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const { isMobile } = useIsMobile();

  const imageWidth = 100;
  const totalWidth = imageWidth * images.length;

  const [props, api] = useSpring(() => ({
    x: 0,
    config: { tension: 280, friction: 60 },
  }));

  const updatePosition = (index: number) => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;

    api.start({
      x: -index * containerWidth,
    });
  };

  const handleImageChange = (direction: "next" | "previous") => {
    if (direction === "next") {
      if (currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx] }) => {
      if (!containerRef.current || !isMobile) return;

      const containerWidth = containerRef.current.offsetWidth;
      const currentOffset = -currentIndex * containerWidth;
      const proposedPosition = currentOffset + mx;

      if (active) {
        api.start({ x: proposedPosition, immediate: true });
      } else {
        const moveThreshold = containerWidth * 0.2;
        const velocityThreshold = 0.5;

        const shouldMoveNext =
          (-mx > moveThreshold || vx < -velocityThreshold) &&
          currentIndex < images.length - 1;

        const shouldMovePrevious =
          (mx > moveThreshold || vx > velocityThreshold) && currentIndex > 0;

        if (shouldMoveNext) {
          setCurrentIndex(currentIndex + 1);
        } else if (shouldMovePrevious) {
          setCurrentIndex(currentIndex - 1);
        } else {
          updatePosition(currentIndex);
        }
      }
    },
    {
      from: () => [props.x.get(), 0],
      filterTaps: true,
      bounds: containerRef.current
        ? {
            left: -containerRef.current.offsetWidth * (images.length - 1),
            right: 0,
          }
        : undefined,
      rubberband: true,
      enabled: isMobile,
      axis: "x",
    },
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
  }, [images]);

  useEffect(() => {
    updatePosition(currentIndex);
  }, [currentIndex]);

  if (images.length === 0) return null;

  return (
    <div ref={containerRef} className={cn("relative size-full")}>
      <Background colors={preloadedColors[currentIndex]} />

      <Colors colors={preloadedColors[currentIndex]} />

      <animated.div
        {...(isMobile ? bind() : {})}
        className={cn(
          "absolute flex h-full",
          isMobile ? "touch-pan-x" : "touch-none",
        )}
        style={{
          width: `${totalWidth}%`,
          x: props.x,
        }}
      >
        {images.map((image, i) => (
          <div
            key={image}
            className={cn("relative h-full select-none")}
            style={{ width: `${imageWidth}%` }}
          >
            <Image
              src={image}
              alt={`Carousel image ${i + 1}`}
              fill
              sizes="840px"
              className={cn("pointer-events-none object-cover")}
              priority
              loading="eager"
            />
          </div>
        ))}
      </animated.div>

      {currentIndex > 0 && (
        <button
          onClick={() => handleImageChange("previous")}
          className={cn(
            "absolute left-4 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-2xl",
            "bg-black shadow-lg",
            "transition-transform",
            "hover:scale-110",
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
            "absolute right-4 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-2xl",
            "bg-black shadow-lg",
            "transition-transform",
            "hover:scale-110",
          )}
          aria-label="Next image"
        >
          →
        </button>
      )}
    </div>
  );
}
