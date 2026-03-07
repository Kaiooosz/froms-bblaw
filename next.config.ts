import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/funnels',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
