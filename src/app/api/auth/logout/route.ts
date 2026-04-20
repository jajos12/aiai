import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('session', '', { expires: new Date(0), path: '/' });
  // Clear Auth.js cookie names used across environments.
  response.cookies.set('authjs.session-token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('__Secure-authjs.session-token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('next-auth.session-token', '', { expires: new Date(0), path: '/' });
  response.cookies.set('__Secure-next-auth.session-token', '', { expires: new Date(0), path: '/' });
  return response;
}