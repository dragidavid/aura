"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

export function Refresh() {
  const router = useRouter();

  const refresh = useCallback(() => {
    const headers = new Headers();
    headers.set("x-timestamp", Date.now().toString());

    router.refresh();
  }, [router]);

  return (
    <button
      onClick={refresh}
      className={cn(
        "flex h-16 w-full items-center justify-center font-mono text-sm uppercase",
        "border-b border-dashed border-stone-800",
        "hover:bg-white hover:text-black",
      )}
    >
      get new image
    </button>
  );
}
