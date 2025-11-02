import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
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
  // trailingSlash: true,
};

export default nextConfig;
