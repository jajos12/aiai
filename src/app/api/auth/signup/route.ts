import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createUser, deleteUnverifiedUserByEmail, getUserByEmail } from '@/lib/db/users';
import { firebaseSendVerificationEmail, firebaseSignUp } from '@/lib/auth/firebaseAuth';

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
      if (Number(existing.is_verified) !== 1) {
        // Keep the email reusable by removing stale unverified records.
        deleteUnverifiedUserByEmail(email);
      } else {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    const stillExisting = getUserByEmail(email);
    if (stillExisting) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    let firebaseSignup;
    try {
      firebaseSignup = await firebaseSignUp(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Firebase signup failed';
      if (/EMAIL_EXISTS/i.test(message)) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      return NextResponse.json({ error: `Firebase signup failed: ${message}` }, { status: 400 });
    }

    try {
      await firebaseSendVerificationEmail(firebaseSignup.idToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send verification';
      return NextResponse.json(
        {
          error: `Account created but verification email failed: ${message}`,
          requiresVerification: true,
          emailSent: false,
        },
        { status: 502 },
      );
    }

    let user = getUserByEmail(email);
    if (!user) {
      const placeholderHash = `firebase:${crypto.randomBytes(24).toString('hex')}`;
      user = createUser(email, placeholderHash, name, undefined);
    }

    return NextResponse.json({
      message: 'Signup successful. Please check your inbox to verify your account.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role, is_verified: 0 },
      requiresVerification: true,
      emailSent: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid request payload' },
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