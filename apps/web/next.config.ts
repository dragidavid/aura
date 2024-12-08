import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
  images: {
    remotePatterns: [{ hostname: "picsum.photos" }],
  },
};

export default nextConfig;
