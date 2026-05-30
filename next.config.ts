import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion"],
  },
  webpack: (config) => {
    // react-pdf / pdfjs-dist tries to require 'canvas' for SSR — alias it away
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
