import { cn } from "@/lib/cn";

import { Code } from "@/components/code";
import { Demo } from "@/components/demo";

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

const USAGE_SERVER = `import { getAura } from "@drgd/aura/server";
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
  title: "Documentation",
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
        "text-2xs absolute -top-2.5 flex items-center justify-center rounded-sm px-1.5 py-0.5 font-mono font-bold uppercase",
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
        <div>
          <h3 className={cn("my-3 font-sans text-lg font-bold")}>
            Installation
          </h3>

          <Code code="pnpm add @drgd/aura sharp" language="bash" />

          <p className={cn("mt-3 text-sm", "text-white/60")}>
            Note: Server-side usage requires the peer dependency{" "}
            <code>sharp</code> to be installed as shown above.
          </p>
        </div>

        <div
          className={cn(
            "relative -mx-8 rounded-xl px-8 pt-2 pb-6",
            "border border-dashed border-emerald-500/40 bg-emerald-500/5",
            "sm:pb-8",
          )}
        >
          <SectionBadge variant="client">client</SectionBadge>

          <h3 className={cn("my-3 font-sans text-lg font-bold")}>Usage</h3>

          <p className={cn("mb-5", "text-white/60")}>
            Use the <code>useAura</code> hook to extract colors in React
            components:
          </p>

          <Code code={BASIC_USAGE_CLIENT} />

          <h3 className={cn("mt-6 mb-3 font-sans font-bold")}>
            <code className="text-lg">useAura</code>
          </h3>

          <p className={cn("mb-5", "text-white/60")}>
            React hook for client-side color extraction with built-in loading
            and error states.
          </p>

          <div className={cn("space-y-3", "text-white/60")}>
            <p className={cn("font-medium", "text-white")}>Parameters:</p>
            <ul className={cn("list-disc space-y-3 pl-6")}>
              <li>
                <code>imageUrl</code>: URL of the image (required)
              </li>
              <li>
                <code>options</code>:
                <ul className={cn("mt-3 list-disc space-y-3 pl-6")}>
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

            <p className={cn("font-medium", "text-white")}>Returns:</p>
            <ul className={cn("list-disc space-y-3 pl-6")}>
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

          <h3 className={cn("mt-6 mb-3 font-sans text-lg font-bold")}>Demo</h3>

          <Demo />
        </div>

        <div
          className={cn(
            "relative -mx-8 rounded-xl px-8 pt-2 pb-6",
            "border border-dashed border-rose-400/30 bg-rose-500/5",
            "sm:pb-8",
          )}
        >
          <SectionBadge variant="server">server</SectionBadge>

          <h3 className={cn("my-3 font-sans text-lg font-bold")}>Usage</h3>

          <p className={cn("mb-5", "text-white/60")}>
            Use the <code>getAura</code> function inside an async Server
            Component. To prevent blocking the initial page load while colors
            are extracted, wrap the component calling the function in{" "}
            <code>&lt;Suspense&gt;</code>.
          </p>

          <Code code={USAGE_SERVER} />

          <h3 className={cn("mt-6 mb-3 font-sans font-bold")}>
            <code className="text-lg">getAura</code>
          </h3>

          <p className={cn("mb-5", "text-white/60")}>
            Server-side function that extracts colors from an image URL using{" "}
            <a
              href="https://github.com/lovell/sharp"
              target="_blank"
              className={cn("underline underline-offset-2", "text-white")}
            >
              sharp ↗
            </a>
            .
          </p>

          <div className={cn("space-y-3", "text-white/60")}>
            <p className={cn("font-medium", "text-white")}>Parameters:</p>
            <ul className={cn("list-disc space-y-3 pl-6")}>
              <li>
                <code>imageUrl</code>: URL of the image (required)
              </li>
              <li>
                <code>options</code>:
                <ul className={cn("mt-3 list-disc space-y-3 pl-6")}>
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

            <p className={cn("font-medium", "text-white")}>Returns:</p>
            <ul className={cn("list-disc space-y-3 pl-6")}>
              <li>
                <code>Promise&lt;AuraColor[]&gt;</code>: Array of colors, where
                each has:
                <ul className={cn("mt-3 list-disc space-y-3 pl-6")}>
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

        <div>
          <h3 className={cn("my-3 font-sans text-lg font-bold")}>
            Error handling & Fallbacks
          </h3>

          <p className={cn("mb-5", "text-white/60")}>
            Both implementations include built-in error handling with fallback
            colors:
          </p>

          <ul className={cn("list-disc space-y-3 pl-6", "text-white/60")}>
            <li>Invalid image URLs</li>
            <li>Network errors</li>
            <li>Timeout errors (10s default)</li>
            <li>Invalid image types</li>
            <li>CORS errors</li>
          </ul>

          <div className={cn("mt-5")}>
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
    </div>
  );
}
