import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  // Allow 127.0.0.1 in development
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
  } as any),
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://127.0.0.1:4001/api/:path*',
        },
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:4001/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
