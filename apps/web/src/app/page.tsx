import Link from "next/link";
import { Suspense } from "react";
import { getAura } from "@drgd/aura/server";
import { getPlaiceholder } from "plaiceholder";

import { Carousel } from "@/components/carousel";
import { TunnelOut } from "@/components/tunnel-out";

import { cn } from "@/lib/cn";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aura",
  description:
    "Extract color palettes from any image. Zero config, works everywhere.",
};

async function getImages() {
  const uniqueSeeds = new Set(
    Array.from({ length: 5 }, () => Math.floor(Math.random() * 1000)),
  );

  while (uniqueSeeds.size < 5) {
    uniqueSeeds.add(Math.floor(Math.random() * 1000));
  }

  return Promise.all(
    Array.from(uniqueSeeds).map(async (seed) => {
      const src = `https://picsum.photos/seed/${seed}/600`;
      const buffer = await fetch(src).then(async (res) =>
        Buffer.from(await res.arrayBuffer()),
      );
      const { base64 } = await getPlaiceholder(buffer);

      return {
        src,
        base64,
      };
    }),
  );
}

async function getColors(images: { src: string; base64: string }[]) {
  const colorsArray = await Promise.all(
    images.map((image) => getAura(image.src)),
  );

  return Object.fromEntries(
    colorsArray.map((colors, index) => [index, colors]),
  );
}

async function Images() {
  const images = await getImages();
  const preloadedColors = await getColors(images);

  return <Carousel images={images} preloadedColors={preloadedColors} />;
}

export default async function Page() {
  return (
    <div className={cn("flex w-full flex-col")}>
      <TunnelOut />

      <div className={cn("flex flex-1 flex-col justify-center gap-8 py-8")}>
        <div className={cn("flex flex-col gap-4 text-center")}>
          <h1 className={cn("font-mono text-3xl font-black")}>aura</h1>

          <p className="text-white/40">
            Extract color palettes from any image.
            <br />
            Zero config, works everywhere.
          </p>
        </div>

        <div className={cn("flex justify-center")}>
          <Link
            href="/docs"
            className={cn(
              "rounded-full px-4 py-2 font-mono text-sm",
              "transition-colors duration-100",
              "border border-white/10 bg-black/20 shadow-lg",
              "hover:bg-white/10",
            )}
          >
            Documentation
          </Link>
        </div>
      </div>

      <div className={cn("flex-3 pb-2")}>
        <div
          className={cn(
            "relative mx-auto h-full max-h-(--container-lg) max-w-md overflow-hidden rounded-xl p-2",
            "border border-white/10 bg-black/20 shadow-lg backdrop-blur-md",
          )}
        >
          <Suspense
            fallback={
              <div
                className={cn(
                  "absolute inset-0 size-full",
                  "animate-pulse bg-white/5",
                )}
              />
            }
          >
            <Images />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
