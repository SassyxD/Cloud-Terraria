/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Standalone output for EC2 deployment
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Optimize for production
  reactStrictMode: true,
  
  // Compression
  compress: true,
  
  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Disable ESLint and TypeScript errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip trailing slash redirects for ngrok
  skipTrailingSlashRedirect: true,
  
  // Trust ngrok proxy headers
  experimental: {
    trustHostHeader: true,
  },
};

export default config;
