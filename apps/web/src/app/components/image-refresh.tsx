"use client";

import { useRouter } from "next/navigation";

export default function ImageRefresh() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.refresh()}
      className="rounded-lg bg-black text-white px-6 py-3 hover:bg-white hover:text-black border border-white transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
    >
      Load New Image
    </button>
  );
}
