import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthSecret } from '@/lib/auth/config';

function forwardWithPathname(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const { pathname, search } = request.nextUrl;
  requestHeaders.set('x-pathname', `${pathname}${search}`);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/tier')) {
    if (!token) {
      const login = new URL('/login', request.nextUrl.origin);
      login.searchParams.set('callbackUrl', `${pathname}${search}`);
      return NextResponse.redirect(login);
    }
    return forwardWithPathname(request);
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
    }
    // Admin role is enforced in `app/admin/layout.tsx` from the database so JWT role
    // cannot block a promoted admin before the token refreshes.
    return forwardWithPathname(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/tier',
    '/tier/:path*',
    '/admin',
    '/admin/:path*',
  ],
};
