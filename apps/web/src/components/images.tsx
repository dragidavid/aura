import Image from "next/image";
import { headers } from "next/headers";
import BackgroundWrapper from "@/components/background-wrapper";
import ImageRefresh from "@/components/image-refresh";
import ClientColors from "@/components/client-colors";
import ServerColors from "@/components/server-colors";

export default async function Images() {
  const headersList = await headers();
  const timestamp = headersList.get("x-timestamp") || Date.now();

  const imageId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${imageId}/400/400?t=${timestamp}`;

  return (
    <>
      <BackgroundWrapper imageUrl={imageUrl} />
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col gap-2">
          <p>Client</p>
          <ClientColors imageUrl={imageUrl} />

          <p>Server</p>
          <ServerColors imageUrl={imageUrl} />
        </div>

        <div className="relative h-96 w-96 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={imageUrl}
            alt="Random image from Picsum"
            fill
            sizes="400px"
            className="object-cover"
            priority
          />
        </div>

        <ImageRefresh />
      </div>
    </>
  );
}
