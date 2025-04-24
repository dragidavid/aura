<div align="center">
  <picture>
    <img alt="Aura logo" src="https://github.com/user-attachments/assets/4ffe1daa-77dd-4e78-8109-f79f90688b7f">
  </picture>
  
  <h1><b>Aura</b></h1>
  <p>Extract color palettes from any image. Zero config, works everywhere.</p>
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/%40drgd%2Faura?style=flat-square)](https://npmjs.org/package/@drgd/aura)
[![License](https://img.shields.io/npm/l/@drgd/aura.svg?style=flat-square)](https://github.com/dragidavid/aura/blob/main/LICENSE)

</div>

## Install

To get started, install the required dependencies:

```bash
npm install @drgd/aura sharp
# or
yarn add @drgd/aura sharp
# or
pnpm add @drgd/aura sharp
```

**Note:** The server-side functionality relies on the `sharp` library. Please refer to the [official `sharp` installation documentation](https://sharp.pixelplumbing.com/install) for platform-specific requirements if you encounter installation issues.

## Usage

Then you can use the `getAura` function (server-side) or `useAura` hook (client-side).

### Server-side

Use `getAura` inside an `async` Server Component. Wrap the component in `<Suspense>` to avoid blocking the initial page load.

```tsx
import { getAura } from "@drgd/aura/server";
import { Suspense } from "react";

// Server Component that gets the colors
async function Colors({ imageUrl }) {
  const colors = await getAura(imageUrl);

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

// Parent Server Component
export default async function Page() {
  const imageUrl = "https://example.com/image.jpg";

  return (
    <div>
      <h1>Image Colors</h1>
      <Suspense fallback={<p>Loading colors...</p>}>
        <Colors imageUrl={imageUrl} />
      </Suspense>
    </div>
  );
}
```

### Client-side

```tsx
import { useAura } from "@drgd/aura/client";

export function Colors() {
  const { colors, isLoading, error } = useAura("https://example.com/image.jpg");

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Error: {error?.message}</p>;

  return (
    <ul>
      {colors.map((color) => (
        <li key={color.hex}>
          {color.hex} - {color.weight}
        </li>
      ))}
    </ul>
  );
}
```

## Documentation

Find the full documentation [here](https://aura.dragi.me/docs).

## Authors

- David Dragovacz ([@dragidavid](https://x.com/dragidavid))

## License

MIT License.
