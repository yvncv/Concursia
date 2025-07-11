import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    domains: ['firebasestorage.googleapis.com', 'next-proj-216fd.web.app'], // Agrega los dominios permitidos
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
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/**'
      }
    ],
  },
};

export default nextConfig;
