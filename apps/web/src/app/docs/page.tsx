import { cn } from "@/lib/cn";

import { Code } from "@/components/code";
import { Demo } from "@/components/demo";

import { siteConfig } from "@/config/site";

import type { Metadata } from "next";

const BASIC_USAGE_CLIENT = `import { useAura } from "@drgd/aura/client";

export function Colors() {
  const { colors, isLoading, error } = useAura("https://picsum.photos/200", {
    paletteSize: 6,
    onError: (error) => console.error(error)
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

const BASIC_USAGE_SERVER = `import { getAura } from "@drgd/aura/server";
import { Suspense } from "react";

// Server Component that gets the colors
async function Colors({ imageUrl }) {
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
    client: "bg-emerald-400 text-black",
    server: "bg-rose-400 text-black",
  };

  return (
    <div
      className={cn(
        "text-2xs absolute -top-2.5 rounded-full px-1.5 py-0.5 font-mono font-bold uppercase",
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
            "sm:pb-8",
          )}
        >
          <SectionBadge variant="client">client</SectionBadge>

          <h1
            className={cn("my-5 font-serif text-xl font-medium tracking-tight")}
          >
            Usage
          </h1>

          <p className="text-white/60">
            Use the <code>useAura</code> hook to extract colors on the client.
          </p>

          <Code code={BASIC_USAGE_CLIENT} />

          <div className={cn("flex flex-col gap-6", "text-white/60")}>
            <div className="space-y-3">
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Parameters:
              </h2>
              <ul className={cn("list-disc space-y-2 pl-6")}>
                <li>
                  <code>imageUrl</code>: URL of the image (required)
                </li>
                <li>
                  <code>options</code>:
                  <ul className={cn("mt-3 list-disc space-y-2 pl-6")}>
                    <li>
                      <code>paletteSize</code>: Number of colors to extract
                      (default: 6, range: 1-12)
                    </li>
                    <li>
                      <code>fallbackColors</code>: Custom fallback colors array
                    </li>
                    <li>
                      <code>onError</code>: Error callback function
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
                Returns:
              </h2>
              <ul className={cn("list-disc space-y-2 pl-6")}>
                <li>
                  <code>colors</code>: Array of <code>AuraColor</code> objects
                </li>
                <li>
                  <code>isLoading</code>: Boolean indicating extraction status
                </li>
                <li>
                  <code>error</code>: Error object if failed, <code>null</code>{" "}
                  otherwise
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
            "sm:pb-8",
          )}
        >
          <SectionBadge variant="server">server</SectionBadge>

          <h1
            className={cn("my-5 font-serif text-xl font-medium tracking-tight")}
          >
            Usage
          </h1>

          <p className="text-white/60">
            Use the <code>getAura</code> function inside an async Server
            Component. To prevent blocking the initial page load while colors
            are extracted, wrap the component calling the function in{" "}
            <code>&lt;Suspense&gt;</code>. Uses{" "}
            <a
              href="https://github.com/lovell/sharp"
              target="_blank"
              className={cn("underline underline-offset-2", "text-white")}
            >
              sharp ↗
            </a>
            .
          </p>

          <Code code={BASIC_USAGE_SERVER} />

          <div className={cn("flex flex-col gap-6", "text-white/60")}>
            <div className={cn("space-y-3")}>
              <h2
                className={cn(
                  "font-serif text-lg font-medium tracking-tight",
                  "text-white",
                )}
              >
                Parameters:
              </h2>
              <ul className={cn("list-disc space-y-2 pl-6")}>
                <li>
                  <code>imageUrl</code>: URL of the image (required)
                </li>
                <li>
                  <code>options</code>:
                  <ul className={cn("mt-3 list-disc space-y-2 pl-6")}>
                    <li>
                      <code>paletteSize</code>: Number of colors to extract
                      (default: 6, range: 1-12)
                    </li>
                    <li>
                      <code>quality</code>: &quot;low&quot; (200px) |
                      &quot;medium&quot; (400px) | &quot;high&quot; (800px)
                    </li>
                    <li>
                      <code>timeout</code>: Maximum processing time in ms
                      (default: 10000)
                    </li>
                    <li>
                      <code>fallbackColors</code>: Custom fallback colors array
                    </li>
                    <li>
                      <code>validateUrl</code>: Enable URL validation (default:
                      true)
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
                Returns:
              </h2>
              <ul className={cn("list-disc space-y-2 pl-6")}>
                <li>
                  <code>Promise&lt;AuraColor[]&gt;</code>: Array of colors,
                  where each has:
                  <ul className={cn("mt-3 list-disc space-y-2 pl-6")}>
                    <li>
                      <code>hex</code>: Hexadecimal color code (e.g.,
                      &quot;#FF0000&quot;)
                    </li>
                    <li>
                      <code>weight</code>: Color prevalence (0-1)
                    </li>
                  </ul>
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
            <ul className={cn("list-disc space-y-2 pl-6")}>
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
