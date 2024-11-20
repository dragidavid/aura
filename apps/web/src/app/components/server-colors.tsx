import { extractAura } from "@drgd/aura/server";

export default async function ServerColors({ imageUrl }: { imageUrl: string }) {
  const colors = await extractAura(imageUrl);

  return (
    <div className="flex justify-evenly gap-2">
      {colors.map((color) => (
        <div
          key={color.hex}
          className="h-10 w-10 rounded-lg"
          style={{ backgroundColor: color.hex }}
        />
      ))}
    </div>
  );
}
