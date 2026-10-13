import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["**.replit.dev", "127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/_book-api/:path*",
        destination: "/api/:path*",
      },
    ];
  },
};

export default nextConfig;
