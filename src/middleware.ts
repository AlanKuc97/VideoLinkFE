
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('authenticated')?.value === 'true';
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/', '/chat'];
  const isProtectedRoute = protectedRoutes.some(route => 
    route === '/' ? pathname === route : pathname.startsWith(route)
  );

  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/chat/:path*', '/login', '/register'],
};
