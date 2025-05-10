import withPlaiceholder from "@plaiceholder/next";

import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "picsum.photos",
  //       port: "",
  //       pathname: "/**",
  //     },
  //   ],
  // },
};

export default withPlaiceholder(nextConfig);
