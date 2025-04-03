import Link from "next/link";

import { Logo } from "@/components/logo";
import { HeaderButtons } from "@/components/header-buttons";

import { cn } from "@/lib/cn";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid min-h-dvh w-screen overflow-hidden",
        "grid-cols-[minmax(24px,1fr)_minmax(0,360px)_minmax(24px,1fr)]",
        "grid-rows-[minmax(48px,1fr)_minmax(0,260px)_32px]",
        "sm:grid-cols-[minmax(48px,1fr)_minmax(0,420px)_minmax(48px,1fr)]",
        "sm:grid-rows-[minmax(48px,1fr)_minmax(0,420px)_minmax(48px,1fr)]",
      )}
    >
      <div
        className={cn(
          "col-span-full row-start-1",
          "pointer-events-none",
          "border-b border-dashed border-white/20",
        )}
      />
      <div
        className={cn(
          "col-start-1 row-span-full",
          "pointer-events-none",
          "border-r border-dashed border-white/20",
        )}
      />

      <section
        className={cn("relative col-start-2 row-start-1 flex flex-col p-3")}
      >
        <div className={cn("flex items-center justify-between")}>
          <Logo />

          <HeaderButtons />
        </div>

        <div className={cn("flex flex-1 flex-col gap-8 px-3 pt-[12%] pb-3")}>
          <div className={cn("flex flex-col gap-4 text-center")}>
            <h1 className={cn("font-mono text-3xl font-black")}>Aura</h1>

            <p className={cn("text-balance", "text-white/60")}>
              Extract color palettes from any image. Zero config, works
              everywhere.
            </p>
          </div>

          <div className={cn("flex justify-center")}>
            <Link
              href="/docs"
              className={cn(
                "rounded-full px-4 py-2 font-mono text-sm",
                "border border-dashed border-white/20 bg-white/10 shadow-lg shadow-black/20",
                "hover:border-white",
              )}
            >
              Documentation
            </Link>
          </div>
        </div>
      </section>

      <main
        className={cn(
          "relative col-start-2 row-start-2 flex items-center justify-center",
        )}
      >
        {children}
      </main>

      <section
        className={cn(
          "col-start-2 row-start-3 flex h-full items-center p-3",
          "sm:items-end",
        )}
      >
        <div className={cn("h-fit w-full text-xs", "text-white/40")}>
          <span>
            images from{" "}
            <a
              href="https://picsum.photos/"
              target="_blank"
              rel="noreferrer"
              className={cn("underline underline-offset-2")}
            >
              Lorem Picsum
            </a>
          </span>
        </div>
      </section>

      <div
        className={cn(
          "col-start-3 row-span-full",
          "pointer-events-none",
          "border-l border-dashed border-white/20",
        )}
      />
      <div
        className={cn(
          "col-span-full row-start-3",
          "pointer-events-none",
          "border-t border-dashed border-white/20",
        )}
      />
    </div>
  );
}
