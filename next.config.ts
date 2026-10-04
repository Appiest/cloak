import type { NextConfig } from "next";

// Set by the GitHub Pages workflow, which serves the deck from appiest.github.io/cloak.
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // The deck is presented from the dev server, and the route indicator renders
  // over the bottom-left corner of the stage.
  devIndicators: false,
  ...(basePath && {
    output: "export",
    basePath,
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
