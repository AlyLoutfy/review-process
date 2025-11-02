import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds, not for development
  // This allows dynamic routes to work in dev mode
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  trailingSlash: true, // Generate /path/index.html instead of /path.html for better GitHub Pages compatibility
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
  // Required for GitHub Pages subdirectory deployment
  basePath: "/review-process",
};

export default nextConfig;
