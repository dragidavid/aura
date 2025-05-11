<div align="center">
  <h1><b>aura</b></h1>
  <p>Grab colors from any image.<br>Works on both server and client.</p>
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/%40drgd%2Faura?style=flat-square)](https://npmjs.org/package/@drgd/aura)
[![License](https://img.shields.io/npm/l/@drgd/aura.svg?style=flat-square)](https://github.com/dragidavid/aura/blob/main/LICENSE)

</div>

![hero](https://aura.drgd.fyi/og.jpg)

## Installation

To get started, install the required dependencies:

```bash
pnpm add @drgd/aura sharp
```

Server-side usage requires the peer dependency `sharp` to be installed as shown above.

## Usage

Import the desired function/hook from the appropriate entry point.

### Client-side

Use the `useAura` hook to extract colors on the client.

```tsx
"use client";

import { useAura } from "@drgd/aura/client";

export function Colors({ imageUrl }: { imageUrl: string }) {
  const { colors, isLoading, error } = useAura(imageUrl, {
    paletteSize: 4, // Optional: Specify number of colors (1-12, default: 6)
    onError: (err) => console.error(error), // Optional: Error callback
  });

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  // On error, 'colors' will contain the fallback palette
  return (
    <ul className>
      {colors.map((color) => (
        <li
          key={color.hex}
          style={{
            backgroundColor: color.hex,
          }}
        >
          {color.hex} -{Math.round(color.weight * 100)}%
        </li>
      ))}
    </ul>
  );
}
```

### Server-side

Use the `getAura` function inside an async Server Component. To prevent blocking the initial page load while the colors are being extracted, wrap the `getAura` call in `<Suspense>`.

We use `sharp` under the hood to process the image. Check out the [sharp ↗](https://sharp.pixelplumbing.com/install) documentation for more information.

```tsx
import { getAura } from "@drgd/aura/server";
import { Suspense } from "react";

// Server Component that gets the colors
async function Colors({ imageUrl }: { imageUrl: string }) {
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
        <li key={color.hex} style={{ backgroundColor: color.hex }}>
          {color.hex} - {Math.round(color.weight * 100)}%
        </li>
      ))}
    </ul>
  );
}

// Parent Server Component
export default async function Page() {
  const imageUrl = "https://example.com/image.jpg";

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

#### Parameters

- `imageUrl: string`: The URL of the image to process
- `options?: object`:
  - `paletteSize?: number`: Number of colors to extract (default: 6, range: 1-12)
  - `fallbackColors?: AuraColor[]`: Custom fallback colors array
  - `onError?: (error: Error) => void`: Error callback function

#### Returns

- `colors: AuraColor[]`: Array of extracted (or fallback) colors, sorted by weight
- `isLoading: boolean`: Boolean indicating extraction status
- `error: Error | null`: Error object if failed, `null` otherwise

### `getAura(imageUrl, options?)` (Server)

Async function for server-side color extraction.

#### Parameters

- `imageUrl: string`: The URL of the image to process
- `options?: object`:
  - `paletteSize?: number`: Number of colors to extract (default: 6, range: 1-12)
  - `quality?: "low" | "medium" | "high"`: "low" (200px) | "medium" (400px) | "high" (800px)
  - `timeout?: number`: Maximum processing time in milliseconds (default: 10000)
  - `fallbackColors?: AuraColor[]`: Custom fallback colors array
  - `validateUrl?: boolean`: Whether to perform internal URL validation checks (protocol, type, size). Recommended to leave enabled unless URLs are pre-validated (default: true)

#### Returns

A promise resolving to the array of extracted (or fallback) colors, sorted by weight. Throws an error only for invalid `paletteSize`. Other errors (network, processing) result in fallback colors being returned.

### `AuraColor` type

```typescript
type AuraColor = {
  hex: string; // Hexadecimal color code (e.g., "#FF0000")
  weight: number; // Color prevalence/importance (0-1)
};
```

## Error Handling

Both implementations include built-in error handling with fallback colors:

- Invalid image URLs
- Network errors
- Timeout errors (10s default)
- Invalid image data
- CORS errors

## Authors

- David Dragovacz ([@dragidavid](https://x.com/dragidavid))

## License

MIT License.
