import { cn } from "@/lib/cn";

import { Code } from "@/components/code";
import { Demo } from "@/components/demo";

import { siteConfig } from "@/config/site";

import type { Metadata } from "next";

const CLIENT_USAGE = `"use client";

import { useAura } from "@drgd/aura/client";

export function Colors({ imageUrl }: { imageUrl: string }) {
  // e.g., "/assets/my-image.webp" or "https://picsum.photos/200"
  const { colors, isLoading, error } = useAura(imageUrl, {
    paletteSize: 4,
    onError: (err) => console.error(err.message),
  });

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {colors.map((color) => (
        <li key={color.hex}>
          {color.hex} - {Math.round(color.weight * 100)}%
        </li>
      ))}
    </ul>
  );
}`;

const SERVER_USAGE_REMOTE = `import { Suspense } from "react";
import { getAura } from "@drgd/aura/server";

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
  const imageUrl = "https://picsum.photos/200";

  return (
    <div>
      <h1>Image Colors</h1>
      <Suspense fallback={<p>Loading colors...</p>}>
        <Colors imageUrl={imageUrl} />
      </Suspense>
    </div>
  );
}`;

const SERVER_USAGE_LOCAL = `import fs from "fs";
import path from "path";
import { Suspense } from "react";
import { getAura } from "@drgd/aura/server";

// Server Component that gets the colors
async function LocalColors({ imageFileName }: { imageFileName: string }) {
  const imagePath = path.join(process.cwd(), "public", "assets", imageFileName);
  let colors;

  try {
    const imageBuffer = await fs.readFile(imagePath);

    colors = await getAura(imageBuffer, { paletteSize: 8 });
  } catch (error) {
    console.error("Failed to process image", error);

    colors = await getAura(Buffer.from(""), { paletteSize: 5 });
  }

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
  return (
    <div>
      <h1>Image Colors</h1>
      <Suspense fallback={<p>Loading colors...</p>}>
        <LocalColors imageFileName="/assets/1.webp" />
      </Suspense>
    </div>
  );
}`;

export const metadata: Metadata = {
  title: "Docs",
  description: siteConfig.description,
  openGraph: {
    title: `Docs - ${siteConfig.name}`,
    description: siteConfig.description,
    url: `${siteConfig.url}/docs`,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage.docs,
        width: 1200,
        height: 630,
        alt: `Docs - ${siteConfig.name}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Docs - ${siteConfig.name}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage.docs],
    creator: "@dragidavid",
  },
};

type SectionBadgeProps = {
  variant: "client" | "server";
  children: React.ReactNode;
};

function SectionBadge({ variant, children }: SectionBadgeProps) {
  const variantStyles = {
    client: "bg-emerald-500/30 inset-ring-emerald-500/40",
    server: "bg-rose-500/30 inset-ring-rose-500/40",
  };

  return (
    <div
      className={cn(
        "text-2xs absolute -top-2.5 rounded-full px-2.5 py-0.5 font-mono font-bold uppercase",
        "inset-ring backdrop-blur-lg",
        variantStyles[variant],
      )}
    >
      <span>{children}</span>
    </div>
  );
}

export default function Page() {
  return (
    <div
      className={cn(
        "fixed inset-0 overflow-x-clip overflow-y-auto px-4 pt-18 pb-4",
      )}
    >
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-18",
          "pointer-events-none",
          "bg-black to-0% mask-b-from-1",
        )}
      />

      <div className={cn("mx-auto flex w-full max-w-2xl flex-col gap-12")}>
        {/* Installation block */}
        <div className="mt-3">
          <h1 className={cn("font-serif text-xl font-medium tracking-tight")}>
            Installation
          </h1>

          <Code
            code="pnpm add @drgd/aura sharp"
            language="bash"
            className="my-4"
          />

          <p className={cn("text-sm", "text-white/60")}>
            Server-side usage requires the peer dependency{" "}
            <code className="text-xs">sharp</code> to be installed as shown
            above.
          </p>
        </div>

        {/* Clien usage block */}
        <div
          className={cn(
            "relative -mx-8 rounded-2xl px-8 pt-2 pb-6",
            "border border-dashed border-emerald-500/40 bg-emerald-500/5",
            "sm:border-2 sm:pb-8",
          )}
        >
          <SectionBadge variant="client">client</SectionBadge>

          <h1
            className={cn("my-5 font-serif text-xl font-medium tracking-tight")}
          >
            Usage
          </h1>

          <div className={cn("space-y-3", "text-white/60")}>
            <p>
              Use the <code>useAura</code> hook to extract colors on the client.
            </p>

            <p>
              It accepts a remote image URL or a local static path (e.g., from
              your <code>public</code> folder).
            </p>
          </div>

          <Code code={CLIENT_USAGE} language="tsx" variant="client" />

          <div className={cn("flex flex-col gap-6", "text-white/60")}>
            <div className="space-y-3">
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Parameters
              </h2>
              <ul className={cn("list-disc space-y-3 pl-6 leading-relaxed")}>
                <li>
                  <code>imageUrl?: string | null</code>
                  <ul
                    className={cn(
                      "mt-3 list-disc space-y-2 pl-6 leading-relaxed",
                    )}
                  >
                    <li>URL of the image or a local static path</li>
                    <li>
                      Uses default <code>fallbackColors</code> if not provided
                    </li>
                  </ul>
                </li>
                <li>
                  <code>options?: object</code>
                  <ul
                    className={cn(
                      "mt-3 list-disc space-y-2 pl-6 leading-relaxed",
                    )}
                  >
                    <li>
                      <code>paletteSize?: number</code> - Number of colors to
                      extract (default: 6, range: 1-12)
                    </li>
                    <li>
                      <code>fallbackColors?: AuraColor[]</code> - Custom
                      fallback colors array
                    </li>
                    <li>
                      <code>{`onError?: (error: Error) => void`}</code> - Error
                      callback function
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Returns
              </h2>
              <ul className={cn("list-disc space-y-2 pl-6 leading-relaxed")}>
                <li>
                  <code>colors: AuraColor[]</code> - Array of extracted (or
                  fallback) colors, sorted by weight
                </li>
                <li>
                  <code>isLoading: boolean</code> - Boolean indicating
                  extraction status
                </li>
                <li>
                  <code>error: Error | null</code> - Error object if failed,{" "}
                  <code>null</code> otherwise otherwise
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Demo
              </h2>

              <Demo />
            </div>
          </div>
        </div>

        {/* Server usage block */}
        <div
          className={cn(
            "relative -mx-8 rounded-2xl px-8 pt-2 pb-6",
            "border border-dashed border-rose-400/30 bg-rose-500/5",
            "sm:border-2 sm:pb-8",
          )}
        >
          <SectionBadge variant="server">server</SectionBadge>

          <h1
            className={cn("my-5 font-serif text-xl font-medium tracking-tight")}
          >
            Usage
          </h1>

          <div className={cn("space-y-3", "text-white/60")}>
            <p>
              Use the <code>getAura</code> function inside an async Server
              Component. It accepts a remote image URL or a <code>Buffer</code>.
            </p>

            <p>
              To prevent blocking the initial page load while colors are
              extracted, wrap <code>getAura</code> call in{" "}
              <code>&lt;Suspense&gt;</code>.
            </p>

            <p>
              We use <code>sharp</code> under the hood to process the image.
              Check out the{" "}
              <a
                href="https://github.com/lovell/sharp"
                target="_blank"
                className={cn("underline underline-offset-2", "text-white")}
              >
                sharp ↗
              </a>{" "}
              documentation for more information.
            </p>
          </div>

          <Code
            code={SERVER_USAGE_REMOTE}
            language="tsx"
            title="Example with an image URL"
            variant="server"
          />

          <Code
            code={SERVER_USAGE_LOCAL}
            language="tsx"
            title="Example with a local image"
            variant="server"
          />

          <div className={cn("flex flex-col gap-6", "text-white/60")}>
            <div className={cn("space-y-3")}>
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Parameters
              </h2>
              <ul className={cn("list-disc space-y-3 pl-6 leading-relaxed")}>
                <li>
                  <code>imageUrlOrBuffer: string | Buffer</code>
                  <ul className={cn("mt-3 list-disc pl-6 leading-relaxed")}>
                    <li>
                      The URL of the image or a <code>Buffer</code> containing
                      image data
                    </li>
                  </ul>
                </li>
                <li>
                  <code>options?: object</code>
                  <ul
                    className={cn(
                      "mt-3 list-disc space-y-2 pl-6 leading-relaxed",
                    )}
                  >
                    <li>
                      <code>paletteSize?: number</code> - Number of colors to
                      extract (default: 6, range: 1-12)
                    </li>
                    <li>
                      <code>
                        quality?: &quot;low&quot; | &quot;medium&quot; |
                        &quot;high&quot;
                      </code>{" "}
                      - &quot;low&quot; (200px) | &quot;medium&quot; (400px) |
                      &quot;high&quot; (800px)
                    </li>
                    <li>
                      <code>timeout?: number</code> - Maximum processing time in
                      milliseconds (default: 10000)
                    </li>
                    <li>
                      <code>fallbackColors?: AuraColor[]</code> - Custom
                      fallback colors array
                    </li>
                    <li>
                      <code>validateUrl?: boolean</code> - Enable URL validation
                      (default: true)
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className={cn("space-y-3")}>
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Returns
              </h2>
              <ul className={cn("list-disc pl-6 leading-relaxed")}>
                <li>
                  <code>Promise&lt;AuraColor[]&gt;</code> - Array of extracted
                  (or fallback) colors, sorted by weight
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h1
            className={cn("mb-5 font-serif text-xl font-medium tracking-tight")}
          >
            Error handling & Fallbacks
          </h1>

          <div className={cn("space-y-3", "text-white/60")}>
            <p>
              Both implementations include built-in error handling with fallback
              colors:
            </p>
            <ul className={cn("list-disc space-y-2 pl-6 leading-relaxed")}>
              <li>Invalid image URLs</li>
              <li>Network errors</li>
              <li>Timeout errors (10s default)</li>
              <li>Invalid image types</li>
              <li>CORS errors</li>
            </ul>
          </div>

          <Code
            code={`// Custom fallback colors
const fallbackColors = [
  { hex: "#FF0000", weight: 0.4 }, // Red
  { hex: "#00FF00", weight: 0.3 }, // Green
  { hex: "#0000FF", weight: 0.3 }  // Blue
];

// Server-side usage
const colors = await getAura(imageUrl, { 
  paletteSize: 3,
  fallbackColors 
});

// Client-side usage
const { colors } = useAura(imageUrl, {
  paletteSize: 3, 
  fallbackColors,
  onError: (error) => console.error(error)
});`}
          />
        </div>
      </div>
    </div>
  );
}
