import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb", // 5 files × 10MB + overhead
    },
  },
};

export default nextConfig;
