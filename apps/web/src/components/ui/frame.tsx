import { cn } from "@/lib/cn";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid min-h-dvh w-screen overflow-hidden",
        "grid-cols-[minmax(48px,1fr)_minmax(0,384px)_minmax(48px,1fr)]",
        "grid-rows-[minmax(48px,1fr)_minmax(0,384px)_48px]",
        "sm:grid-rows-[minmax(48px,1fr)_minmax(0,384px)_minmax(48px,1fr)]",
      )}
    >
      <div
        className={cn(
          "col-span-full row-start-1",
          "pointer-events-none",
          "border-b border-dashed border-fuchsia-200/20",
        )}
      />
      <div
        className={cn(
          "col-start-1 row-span-full",
          "pointer-events-none",
          "border-r border-dashed border-fuchsia-200/20",
        )}
      />

      <main
        className={cn(
          "relative col-start-2 row-start-2 flex items-center justify-center",
        )}
      >
        {children}
      </main>

      <div
        className={cn(
          "col-start-3 row-span-full",
          "pointer-events-none",
          "border-l border-dashed border-fuchsia-200/20",
        )}
      />
      <div
        className={cn(
          "col-span-full row-start-3",
          "pointer-events-none",
          "border-t border-dashed border-fuchsia-200/20",
        )}
      />
    </div>
  );
}
