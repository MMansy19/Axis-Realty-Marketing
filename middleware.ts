import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Skip i18n for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminSecret = process.env.ADMIN_SECRET;
    const adminToken = request.cookies.get('admin_token')?.value;

    // Fail closed: if secret is not configured or token doesn't match, block access
    if (!adminSecret || !adminToken || adminToken !== adminSecret) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Admin login page — redirect to dashboard if already authenticated, no i18n
  if (pathname.startsWith('/admin/login')) {
    const adminSecret = process.env.ADMIN_SECRET;
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminSecret && adminToken && adminToken === adminSecret) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Admin login page — no i18n
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // All other routes — apply i18n
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/admin/:path*', '/api/:path*']
};
