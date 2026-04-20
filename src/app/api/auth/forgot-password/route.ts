import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firebaseSendPasswordResetEmail } from '@/lib/auth/firebaseAuth';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Firebase intentionally returns generic behavior to avoid account enumeration.
    await firebaseSendPasswordResetEmail(email).catch(() => undefined);

    return NextResponse.json({
      message: 'If that email exists, we have sent a reset link.',
      emailSent: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid request payload' },
        { status: 400 }
      );
    }
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}