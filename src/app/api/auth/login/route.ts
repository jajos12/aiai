import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    loginSchema.parse(body);
    return NextResponse.json(
      {
        error: 'This endpoint is deprecated. Use Auth.js credentials sign-in at /api/auth/callback/credentials.',
      },
      { status: 410 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid request payload' },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}