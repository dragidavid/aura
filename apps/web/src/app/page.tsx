import { getAura } from "@drgd/aura/server";
import { getPlaiceholder } from "plaiceholder";

import { Frame } from "@/components/frame";
import { Images } from "@/components/images";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aura",
  description:
    "Extract color palettes from any image. Zero config, works everywhere.",
};

export default async function Page() {
  const uniqueSeeds = new Set(
    Array.from({ length: 5 }, () => Math.floor(Math.random() * 1000)),
  );

  while (uniqueSeeds.size < 5) {
    uniqueSeeds.add(Math.floor(Math.random() * 1000));
  }

  const images: { src: string; base64: string }[] = await Promise.all(
    Array.from(uniqueSeeds).map(async (seed) => {
      const src = `https://picsum.photos/seed/${seed}/600`;
      const buffer = await fetch(src).then(async (res) =>
        Buffer.from(await res.arrayBuffer()),
      );
      const { base64 } = await getPlaiceholder(buffer);

      return {
        src,
        base64,
      };
    }),
  );

  const colorsArray = await Promise.all(
    images.map((image) => getAura(image.src)),
  );

  const colorsByImage = Object.fromEntries(
    colorsArray.map((colors, index) => [index, colors]),
  );

  return (
    <Frame>
      <Images images={images} preloadedColors={colorsByImage} />
    </Frame>
  );
}
