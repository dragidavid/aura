"use client";

import { useAura } from "aura"; // This will use the browser version

export default function ClientColors({ imageUrl }: { imageUrl: string }) {
  const { colors, isLoading, error } = useAura(imageUrl);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
