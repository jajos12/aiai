import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent root auto-detection from climbing to parent folder lockfiles.
    root: process.cwd(),
  },
};

export default nextConfig;
