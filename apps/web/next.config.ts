import nextra from "nextra";
import withPlaiceholder from "@plaiceholder/next";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "picsum.photos" }],
  },
};

const withNextra = nextra({});

export default withPlaiceholder(withNextra(nextConfig));
