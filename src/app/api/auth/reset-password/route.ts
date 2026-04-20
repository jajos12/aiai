import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { firebaseConfirmPasswordReset } from '@/lib/auth/firebaseAuth';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    try {
      await firebaseConfirmPasswordReset(token, password);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid request payload' },
        { status: 400 }
      );
    }
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}