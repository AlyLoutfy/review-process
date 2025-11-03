import type { NextConfig } from "next";

// Only use static export in production builds
// In dev mode, disable it to avoid strict route validation
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Disable static export in dev mode to avoid route validation issues
  // Production builds will still use static export for GitHub Pages
  ...(!isDev ? { output: "export" } : {}),
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
