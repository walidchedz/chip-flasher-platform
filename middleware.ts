import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { jwtVerify } from 'jose';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10s'),
  analytics: true,
  prefix: '@ratelimit/mw',
});

// المسارات المحمية
const protectedPaths = ['/dashboard', '/flasher', '/history', '/settings', '/api/flash'];
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ===== الحماية من CVE-2025-29927 =====
  // إزالة الـ header الضار إذا كان موجوداً
  const requestHeaders = new Headers(request.headers);
  if (requestHeaders.has('x-middleware-subrequest')) {
    requestHeaders.delete('x-middleware-subrequest');
  }
  
  // منع الوصول للملفات الحساسة
  const sensitivePatterns = ['.env', '.git', 'node_modules', '.next', 'package.json'];
  if (sensitivePatterns.some(p => pathname.includes(p))) {
    return new NextResponse(null, { status: 404 });
  }
  
  // ===== Rate Limiting للمسارات الحساسة =====
  if (pathname.startsWith('/api/') || protectedPaths.some(p => pathname.startsWith(p))) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '127.0.0.1';
    
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);
    
    if (!success) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Too many requests. Please slow down.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
            },
          }
        );
      }
      return NextResponse.redirect(new URL('/blocked', request.url));
    }
  }
  
  // ===== التحقق من المصادقة =====
  const sessionToken = request.cookies.get('session')?.value;
  let isAuthenticated = false;
  
  if (sessionToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(sessionToken, secret);
      isAuthenticated = true;
    } catch {
      // Token منتهي أو غير صالح
    }
  }
  
  // إعادة توجيه المستخدمين المصادقين بعيداً عن صفحات تسجيل الدخول
  if (isAuthenticated && authPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // حماية المسارات الخاصة
  if (!isAuthenticated && protectedPaths.some(p => pathname.startsWith(p))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // ===== إضافة هيدرات الأمان =====
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // هيدرات الأمان
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), usb=(self)');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
