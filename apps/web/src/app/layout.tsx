import { Analytics } from "@vercel/analytics/react";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Header } from "@/components/header";

import { cn } from "@/lib/cn";

import { baseUrl } from "@/app/sitemap";

import "@/app/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "aura - Grab colors from images",
    template: "%s - aura",
  },
  description:
    "Extract color palettes from any image. Works on both server and client.",
  keywords: [
    "aura",
    "color",
    "palette",
    "extract",
    "image",
    "react",
    "next.js",
    "extract-colors",
    "color-palette",
    "color-extraction",
    "dominant-colors",
  ],
  authors: [
    {
      name: "dragidavid",
      url: "https://x.com/dragidavid",
    },
  ],
  creator: "dragidavid",
  openGraph: {
    title: "aura",
    description:
      "Extract color palettes from any image. Works on both server and client.",
    url: "https://aura.drgd.fyi",
    siteName: "aura",
    images: [{ url: "https://aura.drgd.fyi/og.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(GeistSans.variable, GeistMono.variable, "antialiased")}
    >
      <body
        className={cn(
          "flex h-dvh flex-col",
          "bg-black text-white",
          "selection:bg-white selection:text-black",
        )}
      >
        <Header />

        <main className={cn("relative flex grow overflow-hidden px-2")}>
          {children}
        </main>

        <Analytics />
      </body>
    </html>
  );
}
