import { Logo } from "@/components/logo";
import { HeaderButtons } from "@/components/header-buttons";

import { cn } from "@/lib/cn";

export function Channel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "transition-all duration-300",
        "grid h-dvh w-screen overflow-hidden",
        "grid-cols-[minmax(24px,1fr)_minmax(0,360px)_minmax(24px,1fr)]",
        "grid-rows-[56px_1fr]",
        "sm:grid-cols-[minmax(48px,1fr)_minmax(0,640px)_minmax(48px,1fr)]",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "col-start-1 row-span-full",
          "pointer-events-none",
          "border-r border-dashed border-white/20",
        )}
      />

      <header
        className={cn(
          "relative col-start-2 flex items-center justify-between p-3",
        )}
      >
        <Logo />

        <HeaderButtons />
      </header>

      <main
        className={cn(
          "relative col-start-2 row-start-2 overflow-x-clip overflow-y-auto",
        )}
      >
        {children}
      </main>

      <div
        aria-hidden="true"
        className={cn(
          "col-start-3 row-span-full",
          "pointer-events-none",
          "border-l border-dashed border-white/20",
        )}
      />
    </div>
  );
}
