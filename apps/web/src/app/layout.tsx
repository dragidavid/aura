import { Analytics } from "@vercel/analytics/react";

import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Noto_Serif } from "next/font/google";
import { Noto_Serif_Display } from "next/font/google";

import { Header } from "@/components/header";

import { cn } from "@/lib/cn";

import { siteConfig } from "@/config/site";

import "@/app/globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Grab colors from any image`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage.base,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage.base],
    creator: "@dragidavid",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
    },
  },
};

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-serif",
});

const notoSerifDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-serif-display",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={cn(
        GeistSans.variable,
        GeistMono.variable,
        notoSerif.variable,
        notoSerifDisplay.variable,
        "antialiased",
      )}
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
