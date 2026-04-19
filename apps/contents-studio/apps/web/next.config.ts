import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@marionette/shared",
    "@marionette/ai-providers",
    "@marionette/elements-core",
    "@marionette/engine-cinema",
    "@marionette/job-runner",
    "@marionette/ui",
  ],
};

export default nextConfig;
