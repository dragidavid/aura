import { cn } from "@/lib/cn";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "404: Page not found",
  },
};

export default function NotFound() {
  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center font-serif font-medium tracking-tight",
      )}
    >
      <h2 className={cn("mr-6 pr-6 text-2xl", "border-r border-white/20")}>
        404
      </h2>

      <p className="text-sm">page not found</p>
    </div>
  );
}
