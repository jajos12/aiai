import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyUser } from '@/lib/db/users';

const verifySchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    const { token } = parsed.data;

    const success = verifyUser(token);
    if (!success) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}