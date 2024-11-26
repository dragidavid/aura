"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function ImageRefresh() {
  const router = useRouter();

  const refresh = useCallback(() => {
    const headers = new Headers();
    headers.set("x-timestamp", Date.now().toString());

    router.refresh();
  }, [router]);

  return (
    <button
      onClick={refresh}
      className="rounded-lg border border-white bg-black px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-white hover:text-black hover:shadow-lg"
    >
      Load New Image
    </button>
  );
}
