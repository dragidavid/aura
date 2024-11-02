import { Suspense } from "react";
import Image from "next/image";

import ImageRefresh from "@/app/components/image-refresh";
import Colors from "@/app/components/colors";

export default async function Images() {
  const imageId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${imageId}/400/400`;

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <Colors imageUrl={imageUrl} />

      <div className="relative w-96 h-96 rounded-2xl overflow-hidden shadow-lg">
        <Suspense
          fallback={<div className="w-full h-full bg-white/5 animate-pulse" />}
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
