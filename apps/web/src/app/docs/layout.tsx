import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aura Docs",
  description:
    "Extract color palettes from any image. Zero config, works everywhere.",
};

const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>;
const navbar = (
  <Navbar
    logo={<b>Nextra</b>}
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>;

export default async function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout
      banner={banner}
      navbar={navbar}
      pageMap={await getPageMap()}
      docsRepositoryBase="https://github.com/dragidavid/aura"
      footer={footer}
    >
      {children}
    </Layout>
  );
}
