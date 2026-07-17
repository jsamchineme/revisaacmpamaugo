import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Unique deployment ID for version-skew protection across restarts
  deploymentId: process.env.DEPLOYMENT_ID,

  // Image optimization via Sharp (self-hosted)
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "revisaacmpamaugo.online",
      },
    ],
  },

  // Enable React strict mode for development
  reactStrictMode: true,

  // Compress responses (gzip/brotli handled by Nginx in production)
  compress: true,

  // Headers for security, caching, and streaming support
  async headers() {
    return [
      {
        source: "/:path*{/}?",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Disable nginx buffering so streaming (Suspense/ISR) works
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
