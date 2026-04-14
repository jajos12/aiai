import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getUserByEmail, createPasswordResetToken } from '@/lib/db/users';
import { sendPasswordResetEmail } from '@/lib/auth/email';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { message: 'If that email exists, we have sent a reset link.' }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    createPasswordResetToken(user.id, token, expiresAt);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    const mailResult = await sendPasswordResetEmail(email, resetUrl);
    if (!mailResult.ok) {
      console.warn(`Password reset email delivery failed for ${email}: ${mailResult.reason}`);
      console.log(`Fallback reset URL for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: 'If that email exists, we have sent a reset link.',
      emailSent: mailResult.ok,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
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