import { cn } from "@/lib/cn";

type Props = {
  size?: number;
};

export function Logo({ size = 32 }: Props) {
  return (
    <div className="relative" style={{ width: size * 2, height: size }}>
      <div
        className={cn(
          "absolute left-0 rounded-full",
          "border border-dashed border-white/20 bg-white/10 shadow-lg shadow-black",
        )}
        style={{ width: size, height: size }}
      />
      <div
        className={cn(
          "absolute rounded-full",
          "border border-dashed border-white/20 bg-white/10 shadow-lg shadow-black backdrop-blur-sm",
        )}
        style={{
          width: size,
          height: size,
          left: size / 2,
        }}
      />
      <div
        className={cn(
          "absolute rounded-full",
          "border border-dashed border-white/70 bg-black/20 shadow-lg shadow-black backdrop-blur-sm",
        )}
        style={{
          width: size,
          height: size,
          left: size,
        }}
      />
    </div>
  );
}
