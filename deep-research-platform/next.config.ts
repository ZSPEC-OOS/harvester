import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }] }];
  },
};

export default nextConfig;
