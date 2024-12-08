import { Client } from "@/components/extracted-colors/client";
import { Server } from "@/components/extracted-colors/server";

import { cn } from "@/lib/cn";

export function ExtractedColors({ imageUrl }: { imageUrl: string }) {
  return (
    <div
      className={cn(
        "absolute bottom-full flex w-full flex-col text-xs uppercase",
        "border-y border-dashed border-fuchsia-200/20 bg-black",
        "[&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-dashed [&>*:not(:first-child)]:border-fuchsia-200/20",
      )}
    >
      <Client imageUrl={imageUrl} />
      <Server imageUrl={imageUrl} />
    </div>
  );
}
