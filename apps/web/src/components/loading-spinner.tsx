import { cn } from "@/lib/cn";

export function LoadingSpinner() {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "h-full min-h-[400px] w-full",
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full",
          "h-8 w-8 border-4",
          "border-primary/20 border-t-primary",
        )}
      />
    </div>
  );
}
