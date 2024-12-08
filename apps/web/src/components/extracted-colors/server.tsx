import { Suspense } from "react";
import { extractAura } from "@drgd/aura/server";
import { cn } from "@/lib/cn";

function ColorPlaceholder() {
  return (
    <div className={cn("relative flex w-full flex-col")}>
      <span className="py-2">server</span>

      <div className={cn("h-8", "bg-black")} />
    </div>
  );
}

async function Colors({ imageUrl }: { imageUrl: string }) {
  const colors = await extractAura(imageUrl);

  return (
    <div className={cn("relative flex w-full flex-col justify-around")}>
      <span className="py-2">server</span>

      <div className={cn("flex justify-between gap-px")}>
        {colors.map((color) => (
          <div
            key={color.hex}
            className={cn("h-8 w-full")}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
}

export function Server({ imageUrl }: { imageUrl: string }) {
  return (
    <Suspense fallback={<ColorPlaceholder />}>
      <Colors imageUrl={imageUrl} />
    </Suspense>
  );
}
