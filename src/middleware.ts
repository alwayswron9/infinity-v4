import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/test',
  '/api/auth/login',
  '/api/auth/register',
  '/',
  '/api/auth/logout',
];

// Add paths that require authentication but should bypass the /api/data check
const PROTECTED_API_PATHS = [
  '/api/auth/apikey',
  '/api/auth/me',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  const isProtectedApiPath = PROTECTED_API_PATHS.some(path => pathname.startsWith(path));
  const isApiPath = pathname.startsWith('/api/');

  // Redirect authenticated users away from login/register
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    const redirectPath = request.nextUrl.searchParams.get('from') || '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Allow public paths and protected API routes
  if (isPublicPath || isProtectedApiPath || (isApiPath && !pathname.startsWith('/api/data'))) {
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 