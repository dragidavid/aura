<div align="center">
  <h1><b>Aura</b></h1>
  <p>Extract beautiful color palettes from any image. Zero config, works everywhere.</p>
</div>

<div align="center">

[![NPM version](https://img.shields.io/npm/v/%40drgd%2Faura?style=flat-square)](https://npmjs.org/package/@drgd/aura)
[![License](https://img.shields.io/npm/l/@drgd/aura.svg?style=flat-square)](https://github.com/dragidavid/aura/blob/main/LICENSE)

</div>

## Install

To start using Aura, you need to install the package.

```bash
npm install @drgd/aura
```

## Usage

Then you can use the `getAura` function (server-side) or `useAura` hook (client-side).

### Server-side

```tsx
import { getAura } from "@drgd/aura/server";

export async function Colors() {
  const colors = await getAura("https://example.com/image.jpg");

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
