import { Suspense } from "react";
import Image from "next/image";

import ImageRefresh from "@/app/components/image-refresh";

import ClientColors from "@/app/components/client-colors";
import ServerColors from "@/app/components/server-colors";

export default async function Images() {
  const imageId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${imageId}/400/400`;

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col gap-2">
        <p>Client</p>
        <ClientColors imageUrl={imageUrl} />

        <p>Server</p>
        <ServerColors imageUrl={imageUrl} />
      </div>

      <div className="relative h-96 w-96 overflow-hidden rounded-2xl shadow-lg">
        <Suspense
          fallback={<div className="h-full w-full animate-pulse bg-white/5" />}
        >
          <Image
            src={imageUrl}
            alt="Random image from Picsum"
            fill
            sizes="400px"
            className="object-cover"
            priority
          />
        </Suspense>
      </div>

      <ImageRefresh />
    </div>
  );
}
