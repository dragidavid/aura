import fs from "fs";
import path from "path";
import Link from "next/link";
import { Suspense } from "react";
import { getAura } from "@drgd/aura/server";

import { Carousel } from "@/components/carousel";
import { TunnelOut } from "@/components/tunnel-out";

import { cn } from "@/lib/cn";
import { getRandomImages } from "@/lib/image";

async function getColors(images: string[]) {
  const colorsArray = await Promise.all(
    images.map(async (image) => {
      const fsPath = path.join(process.cwd(), "public", image);

      try {
        const buffer = fs.readFileSync(fsPath);

        return getAura(buffer);
      } catch (e) {
        console.error(`[@drgd/aura] - Failed to read image ${image}:`, e);

        return [];
      }
    }),
  );

  return Object.fromEntries(
    colorsArray.map((colors, index) => [index, colors]),
  );
}

async function Images() {
  const images = getRandomImages(5, 30);
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
            "relative mx-auto h-full max-h-(--container-lg) max-w-md overflow-hidden rounded-xl p-1",
            "bg-white/5 inset-ring inset-ring-white/10",
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
