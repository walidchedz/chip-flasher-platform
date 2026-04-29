import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10s'),
  analytics: true,
  prefix: '@ratelimit/middleware',
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // منع الوصول إلى ملفات敏感ة
  if (pathname.includes('.env') || pathname.includes('.git') || pathname.includes('node_modules')) {
    return NextResponse.redirect(new URL('/404', request.url));
  }
  
  // حماية API من الـ Rate Limiting
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    
    const { success, limit, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': '10' } }
      );
    }
  }
  
  // إضافة هيدرات الأمان
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/flasher/:path*'],
};
