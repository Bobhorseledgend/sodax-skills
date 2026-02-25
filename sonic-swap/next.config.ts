import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@sodax/sdk",
    "@sodax/types",
    "@sodax/dapp-kit",
    "@sodax/wallet-sdk-react",
    "@sodax/wallet-sdk-core",
  ],
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
  // Webpack fallback for packages that need externals
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
