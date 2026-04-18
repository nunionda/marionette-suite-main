import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@marionette/ui"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
