import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, validateSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('session')?.value;
    if (token) {
      deleteSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', '', { expires: new Date(0), path: '/' });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}