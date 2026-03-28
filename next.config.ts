import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["homelab", "2.126.225.75", "dev.sipshield.co.uk"],
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
