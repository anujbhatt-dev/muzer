import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com'
      },
      {
        protocol:"http",
        hostname:"img.youtube.com",
      },
      {
        protocol:"https",
        hostname:"fastly.picsum.photos"
      }
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
