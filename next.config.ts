import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
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
  // If deploying to a subdirectory (e.g., https://username.github.io/repo-name)
  // Uncomment and set the basePath:
  // basePath: "/repo-name",
};

export default nextConfig;
