import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly root file tracing to this directory so Next.js doesn't get
  // confused by the root-level lockfile from the archived Vite prototype.
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }] }];
  },
};

export default nextConfig;
