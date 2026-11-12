import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auth pages read cookies() per-request, so standard dynamic rendering fits best.
  // (Cache Components disabled to keep rendering behavior simple for this app.)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
