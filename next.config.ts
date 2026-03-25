import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["homelab"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
