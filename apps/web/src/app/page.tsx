import { Background } from "@/components/background";
import { Images } from "@/components/images";
import { Refresh } from "@/components/refresh";

import { cn } from "@/lib/cn";

export default function Home() {
  return (
    <div
      className={cn(
        "grid min-h-screen grid-cols-[minmax(24px,1fr)_minmax(0,420px)_minmax(24px,1fr)] grid-rows-[minmax(24px,1fr)_minmax(0,420px)_minmax(24px,1fr)]",
      )}
    >
      <div
        className={cn(
          "col-span-full row-start-1",
          "pointer-events-none",
          "border-b border-dashed border-stone-800",
        )}
      />
      <div
        className={cn(
          "col-start-1 row-span-full",
          "pointer-events-none",
          "border-r border-dashed border-stone-800",
        )}
      />

      <main className={cn("relative col-start-2 row-start-2")}>
        <Background />

        <Images />
      </main>

      <section className={cn("col-start-2 row-start-3")}>
        <Refresh />
      </section>

      <div
        className={cn(
          "col-start-3 row-span-full",
          "pointer-events-none",
          "border-l border-dashed border-stone-800",
        )}
      />
      <div
        className={cn(
          "col-span-full row-start-3",
          "pointer-events-none",
          "border-t border-dashed border-stone-800",
        )}
      />
    </div>
  );
}
