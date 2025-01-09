import Link from "next/link";

import { Logo } from "@/components/ui/logo";
import { HeaderButtons } from "@/components/ui/header-buttons";

import { cn } from "@/lib/cn";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid min-h-dvh w-screen overflow-hidden",
        "grid-cols-[minmax(24px,1fr)_minmax(0,360px)_minmax(24px,1fr)]",
        "grid-rows-[minmax(48px,1fr)_minmax(0,260px)_48px]",
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

        <div className={cn("flex flex-1 flex-col gap-8 px-3 pb-3 pt-[14%]")}>
          <div className={cn("flex flex-col gap-4 text-center")}>
            <h1 className={cn("text-2xl font-bold")}>Aura</h1>

            <p className={cn("text-balance text-sm", "text-white/50")}>
              Extract color palettes from any image. Zero config, works
              everywhere.
            </p>
          </div>

          <div className={cn("flex justify-center")}>
            <Link
              href="/docs"
              className={cn(
                "rounded-full px-3.5 py-2.5 text-sm",
                "border border-dashed border-white/20",
                "hover:border-solid hover:bg-white/20",
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
        <div className={cn("h-fit w-full text-xs", "text-white/30")}>
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
