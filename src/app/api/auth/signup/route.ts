import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { hashPassword } from '@/lib/auth/password';
import { createUser, getUserByEmail } from '@/lib/db/users';
import { sendVerificationEmail } from '@/lib/auth/email';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = signupSchema.parse(body);

    const existing = getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const passwordHash = hashPassword(password);
    const user = createUser(email, passwordHash, name, verificationToken);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify?token=${encodeURIComponent(verificationToken)}`;
    
    const mailResult = await sendVerificationEmail(email, verificationUrl);
    if (!mailResult.ok) {
      console.warn(`Verification email delivery failed for ${email}: ${mailResult.reason}`);
      console.log(`Fallback verification URL for ${email}: ${verificationUrl}`);
    }
    
    return NextResponse.json({
      message: 'Signup successful. Please check your email to verify your account.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, is_verified: 0 },
      requiresVerification: true,
      // Exposed for local/dev flow where no mail provider is configured.
      verificationUrl,
      emailSent: mailResult.ok,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}