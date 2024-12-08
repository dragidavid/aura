import Image from "next/image";
import { revalidatePath } from "next/cache";

import { cn } from "@/lib/cn";

import { ExtractedColors } from "@/components/extracted-colors";

export function Images({ imageUrl }: { imageUrl: string }) {
  return (
    <div className={cn("relative size-full")}>
      <ExtractedColors imageUrl={imageUrl} />

      <Image
        src={imageUrl}
        alt="Random image from Picsum"
        fill
        sizes="840px"
        className="object-cover"
        priority
        loading="eager"
      />

      <form>
        <button
          formAction={async () => {
            "use server";
            revalidatePath("/");
          }}
          className={cn(
            "absolute top-full flex h-16 w-full items-center justify-center text-sm uppercase",
            "border-y border-dashed border-fuchsia-200/20 bg-black",
            "transition-colors duration-100",
            "hover:bg-white hover:text-black",
          )}
        >
          get new image
        </button>
      </form>
    </div>
  );
}
