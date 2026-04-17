import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: [
    "@marionette/design-tokens",
    "@marionette/pipeline-core",
    "@marionette/types-content",
    "@marionette/content-profiles",
  ],
};

export default config;
