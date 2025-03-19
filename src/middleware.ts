import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/auth', '/api'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  // Skip middleware for static files and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Redirect root to auth page
  if (pathname === '/') {
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // For child routes, check if there's a selected child ID
  if (pathname.startsWith('/child') && pathname !== '/child/select') {
    const selectedChildId = request.cookies.get('selectedChildId')?.value;
    
    if (!selectedChildId) {
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  // For parent routes, check if parent mode is enabled
  if (pathname.startsWith('/parent')) {
    const parentMode = request.cookies.get('parentMode')?.value;
    
    if (!parentMode) {
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
