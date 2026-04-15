import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthSecret } from '@/lib/auth/config';

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', origin));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', origin));
    }
    const role = String(token.role ?? 'user');
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', origin));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
