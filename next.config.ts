import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/main",
        destination: "/hrms",
        permanent: true,
      },
      {
        source: "/main/:path*",
        destination: "/hrms/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

