import { getAura } from "@drgd/aura/server";

import { Images } from "@/components/images";

import { Frame } from "@/components/ui/frame";

export const dynamic = "force-dynamic";

export default async function Page() {
  const images = Array.from(
    { length: 5 },
    () =>
      `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/800/600`,
  );

  const colorsArray = await Promise.all(
    images.map((imageUrl) => getAura(imageUrl)),
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
