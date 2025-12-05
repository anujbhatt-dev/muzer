import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
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
  }
};

export default nextConfig;
