import Link from "next/link";

import { cn } from "@/lib/cn";

type Props = {
  size?: number;
};

export function Logo({ size = 32 }: Props) {
  return (
    <Link
      href="/"
      className={cn("relative rounded-full", "focus-visible:outline-none")}
      style={{ width: size * 2, height: size }}
      aria-label="Go home"
    >
      <div
        className={cn(
          "absolute left-0 rounded-full",
          "border border-dashed border-white/20 bg-white/10 shadow-lg shadow-black",
        )}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute rounded-full",
          "border border-dashed border-white/20 bg-white/10 shadow-lg shadow-black backdrop-blur-xs",
        )}
        style={{
          width: size,
          height: size,
          left: size / 2,
        }}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute rounded-full",
          "border border-dashed border-white/70 bg-black/20 shadow-lg shadow-black backdrop-blur-xs",
        )}
        style={{
          width: size,
          height: size,
          left: size,
        }}
        aria-hidden="true"
      />
    </Link>
  );
}
