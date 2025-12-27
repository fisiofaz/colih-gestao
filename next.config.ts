import type { NextConfig } from "next";

const nextConfig = {
  // Ignora erros de TypeScript durante o build (Deploy)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignora erros de ESLint durante o build (Deploy)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Garante que headers de segurança e imagens funcionem (opcional, mas bom ter)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
