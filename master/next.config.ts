import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    HTTPS: "true",
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
