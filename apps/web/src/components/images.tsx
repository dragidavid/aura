import Image from "next/image";
import { headers } from "next/headers";

import { cn } from "@/lib/cn";

export async function Images() {
  const headersList = await headers();
  const timestamp = headersList.get("x-timestamp") || Date.now();

  const imageId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${imageId}/840/840?t=${timestamp}`;

  console.log(imageUrl);

  return (
    <div className={cn("relative size-full")}>
      <Image
        src={imageUrl}
        alt="Random image from Picsum"
        fill
        sizes="840px"
        className="object-cover"
        priority
      />
    </div>
  );
}
