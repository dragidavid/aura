import { Suspense } from "react";
import { connection } from "next/server";

import { Images } from "@/components/images";
import { Background } from "@/components/background";

import { Frame } from "@/components/ui/frame";

async function Page() {
  await connection();

  const imageId = Math.floor(Math.random() * 1000);
  const imageUrl = `https://picsum.photos/seed/${imageId}/840/840`;

  return <Images imageUrl={imageUrl} />;
}

export default function Home() {
  return (
    <Frame>
      <Background />

      <Suspense fallback={<span>×</span>}>
        <Page />
      </Suspense>
    </Frame>
  );
}
