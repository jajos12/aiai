import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent root auto-detection from climbing to parent folder lockfiles.
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
