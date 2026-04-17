import type { NextConfig } from "next";

const config: NextConfig = {
  // Package transpilation for in-tree workspace packages
  transpilePackages: [
    "@marionette/design-tokens",
    "@marionette/pipeline-core",
    "@marionette/types-content",
    "@marionette/content-profiles",
  ],
};

export default config;
