import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://129.159.239.239:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
