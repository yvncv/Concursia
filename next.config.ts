import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.peru.travel",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "portal.andina.pe",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.www.gob.pe",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "perusumaq.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
