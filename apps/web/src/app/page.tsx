import fs from "fs";
import path from "path";
import Link from "next/link";
import { Suspense } from "react";
import { getAura } from "@drgd/aura/server";

import { Carousel } from "@/components/carousel";
import { TunnelOut } from "@/components/tunnel-out";

import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

async function getImages(): Promise<{ src: string }[]> {
  const imageDirectory = path.join(process.cwd(), "public/assets");
  let imageFiles: string[];
  try {
    imageFiles = fs
      .readdirSync(imageDirectory)
      .filter((file) => file.endsWith(".webp"));
  } catch (error) {
    console.error("Failed to read image directory:", error);
    return [];
  }

  if (imageFiles.length === 0) {
    return [];
  }

  const shuffled = imageFiles.sort(() => 0.5 - Math.random());
  const selectedFiles = shuffled.slice(0, Math.min(5, imageFiles.length));

  return selectedFiles.map((file) => {
    return {
      src: `/assets/${file}`, // Path for next/image
    };
  });
}

// Updated to pass Buffer directly to getAura
async function getColors(images: { src: string }[]) {
  const colorsArray = await Promise.all(
    images.map(async (image, index) => {
      const fileSystemPath = path.join(process.cwd(), "public", image.src);
      try {
        const imageBuffer = fs.readFileSync(fileSystemPath);
        return getAura(imageBuffer); // Pass Buffer directly to getAura
      } catch (error) {
        console.error(`Failed to read image ${image.src} for getAura:`, error);
        return []; // Or a default AuraColor[]
      }
    }),
  );

  return Object.fromEntries(
    // Key by numerical index, corresponding to the order in the images array
    colorsArray.map((colors, index) => [index, colors]),
  );
}

async function Images() {
  const images = await getImages();
  if (images.length === 0) {
    return <p>No images found to display.</p>;
  }
  const preloadedColors = await getColors(images);

  return <Carousel images={images} preloadedColors={preloadedColors} />;
}

export default async function Page() {
  return (
    <div className={cn("flex w-full flex-col")}>
      <TunnelOut />

      <div
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-12 py-8 text-center",
        )}
      >
        <div className={cn("flex flex-col items-center gap-6")}>
          <div
            className={cn(
              "relative w-fit rounded-full px-6 pb-1",
              "select-none",
              "bg-black/20",
            )}
          >
            <h1
              className={cn(
                "font-serif-display text-2xl font-semibold tracking-tighter",
              )}
            >
              aura
            </h1>
          </div>

          <p className="text-white/40">
            Grab colors from any image.
            <br />
            Works on both server and client.
          </p>
        </div>

        <div className={cn("w-fit")}>
          <Link href="/docs" className={cn("group flex gap-3")}>
            <div
              className={cn(
                "rounded-full px-6 py-2",
                "transition-colors duration-100",
                "border border-white bg-black/10",
                "group-hover:bg-white/20",
              )}
            >
              <span className={cn("font-serif font-medium tracking-tight")}>
                view docs
              </span>
            </div>
            <div
              className={cn(
                "relative grid size-[43px] place-items-center rounded-full",
                "transition-colors duration-100",
                "border border-white bg-black/10",
                "group-hover:bg-white/20",
              )}
            >
              <span
                className={cn(
                  "absolute -left-3.5 h-0.5 w-[calc(100%-2px)] rounded-full",
                  "bg-white",
                )}
              />
              <svg
                viewBox="0 0 24 24"
                className={cn("ml-0.5 size-6", "fill-none stroke-current")}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      <div className={cn("flex-1 pb-2", "sm:flex-3")}>
        <div
          className={cn(
            "relative mx-auto h-full max-h-(--container-lg) max-w-md overflow-hidden rounded-2xl p-2",
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
