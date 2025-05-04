<div align="center">
  <picture>
    <img alt="logo" src="https://raw.githubusercontent.com/dragidavid/aura/refs/heads/main/apps/web/public/aura_logo_large.png?token=GHSAT0AAAAAAC2U6AGATWMIXTA4Q26EVN5Q2AXXPSA" width="150">
  </picture>
  
  <h1><b>@drgd/aura</b></h1>
  <p>Extract color palettes from any image.<br> Zero config, works everywhere.</p>
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/%40drgd%2Faura?style=flat-square)](https://npmjs.org/package/@drgd/aura)
[![License](https://img.shields.io/npm/l/@drgd/aura.svg?style=flat-square)](https://github.com/dragidavid/aura/blob/main/LICENSE)

</div>

## Installation

To get started, install the required dependencies:

```bash
pnpm add @drgd/aura sharp
```

**Note:** `sharp` is a **peer dependency** required only for **server-side** usage (`getAura`). If you only use the client-side hook (`useAura`), you don't need to install `sharp`. Please refer to the [official `sharp` installation documentation](https://sharp.pixelplumbing.com/install) if you encounter platform-specific installation issues.

## Usage

Import the desired function/hook from the appropriate entry point.

### Client-side

Use the `useAura` hook within your React components. It handles loading and error states internally.

```tsx
// app/components/my-image-colors.tsx
"use client";

import { useAura } from "@drgd/aura/client";

export function MyImageColors({ imageUrl }: { imageUrl: string }) {
  const { colors, isLoading, error } = useAura(imageUrl, {
    paletteSize: 5, // Optional: Specify number of colors (1-12, default: 6)
    // fallbackColors: [{ hex: '#...', weight: 1 }], // Optional: Custom fallbacks
    onError: (err) => console.error("Aura failed:", err.message), // Optional: Error callback
  });

  if (isLoading) return <p>Loading colors...</p>;

  // You can optionally display the error message
  // if (error) return <p>Error loading colors: {error.message}</p>;

  // On error, 'colors' will contain the fallback palette
  return (
    <ul className="flex gap-2 p-0 m-0 list-none">
      {colors.map((color) => (
        <li
          key={color.hex}
          className="bg-white/10 rounded-full size-10 flex items-center justify-center text-sm text-white/70"
          style={{
            backgroundColor: color.hex,
          }}
          title={`${color.hex} (${Math.round(color.weight * 100)}%)`}
        >
          {/* Display hex or weight */}
        </li>
      ))}
    </ul>
  );
}
```

### Server-side (Function)

Use the `getAura` function within `async` Server Components or server environments. Wrap Server Components using it in `<Suspense>` to avoid blocking.

```tsx
// app/page.tsx
import { getAura } from "@drgd/aura/server";
import { Suspense } from "react";

async function ColorsDisplay({ imageUrl }: { imageUrl: string }) {
  // Fetches colors server-side. Returns fallbacks on error.
  const colors = await getAura(imageUrl, {
    paletteSize: 8, // Optional: Specify number of colors (1-12, default: 6)
    // quality: 'high', // Optional: 'low' (200px), 'medium' (400px), 'high' (800px)
    // timeout: 5000, // Optional: Max processing time in ms (default: 10000)
    // validateUrl: false, // Optional: Disable internal URL checks (default: true)
    // fallbackColors: [{ hex: '#...', weight: 1 }], // Optional: Custom fallbacks
  });

  return (
    <ul>
      {colors.map((color) => (
        <li key={color.hex} style={{ color: color.hex }}>
          {color.hex} ({Math.round(color.weight * 100)}%)
        </li>
      ))}
    </ul>
  );
}

export default async function Page() {
  const imageUrl =
    "https://images.unsplash.com/photo-1715941321781-face91416653"; // Example

  return (
    <div>
      <h1>Image Colors</h1>
      <Suspense fallback={<p>Loading colors...</p>}>
        <ColorsDisplay imageUrl={imageUrl} />
      </Suspense>
    </div>
  );
}
```

## API Reference

### `useAura(imageUrl, options?)` (Client)

React hook for client-side color extraction.

- `imageUrl: string`: The URL of the image to process.
- `options?: object`:
  - `paletteSize?: number`: Number of colors to extract (Range: 1-12, Default: 6).
  - `fallbackColors?: AuraColor[]`: Custom array of fallback colors (`{ hex: string; weight: number }[]`) to use if extraction fails. Defaults to a predefined grayscale palette.
  - `onError?: (error: Error) => void`: Callback function triggered when an error occurs during extraction.
- **Returns:** `AuraResponse` object:
  - `colors: AuraColor[]`: Array of extracted (or fallback) colors, sorted by weight.
  - `isLoading: boolean`: True while the image is being processed.
  - `error: Error | null`: An Error object if extraction failed, otherwise null.

### `getAura(imageUrl, options?)` (Server)

Async function for server-side color extraction.

- `imageUrl: string`: The URL of the image to process.
- `options?: object`:
  - `paletteSize?: number`: Number of colors to extract (Range: 1-12, Default: 6).
  - `timeout?: number`: Maximum processing time in milliseconds (Default: 10000).
  - `quality?: "low" | "medium" | "high"`: Image processing quality/resolution hint (Default: 'medium' equivalent, internally uses 400px max dimension). 'low' (200px), 'high' (800px).
  - `validateUrl?: boolean`: Whether to perform internal URL validation checks (protocol, type, size). Recommended to leave enabled unless URLs are pre-validated (Default: true).
  - `fallbackColors?: AuraColor[]`: Custom array of fallback colors (`{ hex: string; weight: number }[]`) to use if extraction fails. Defaults to a predefined grayscale palette.
- **Returns:** `Promise<AuraColor[]>`: A promise resolving to the array of extracted (or fallback) colors, sorted by weight. Throws an error only for invalid `paletteSize`. Other errors (network, processing) result in fallback colors being returned.

### `AuraColor` Type

```typescript
type AuraColor = {
  hex: string; // Hexadecimal color code (e.g., "#FF0000")
  weight: number; // Color prevalence/importance (0-1)
};
```

## Error Handling

Both `getAura` and `useAura` are designed to be resilient.

- **`getAura` (Server):** Catches most errors internally (network, timeout, invalid image data) and returns the fallback palette. It only throws if the `paletteSize` option is invalid.
- **`useAura` (Client):** Manages internal loading and error states. If an error occurs (network, timeout, invalid image), it sets the `error` state value, calls the `onError` callback (if provided), and returns the fallback palette in the `colors` state value. Your React component will not crash.

## Authors

- David Dragovacz ([@dragidavid](https://x.com/dragidavid))

## License

MIT License.
