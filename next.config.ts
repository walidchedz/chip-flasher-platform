import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // أمان إضافي
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), usb=()' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.upstash.io https://*.neon.tech",
            "frame-ancestors 'none'",
            "form-action 'self'",
          ].join('; '),
        },
      ],
    },
  ],
  // إعدادات الـ WebSerial/WebUSB
  serverExternalPackages: ['@neondatabase/serverless'],
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // إعدادات الصور
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
