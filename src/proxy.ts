import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthSecret } from '@/lib/auth/config';

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
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
    }
    // Admin role is enforced in `app/admin/layout.tsx` from the database so JWT role
    // cannot block a promoted admin before the token refreshes.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/tier/:path*'],
};
