import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { hashPassword } from '@/lib/auth/password';
import { createUser, getAllUsers, updateUser, verifyUser } from '@/lib/db/users';

const setupSchema = z.object({
  setupSecret: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.SETUP_SECRET;
    if (!configuredSecret) {
      return NextResponse.json(
        { error: 'Setup is disabled. Set SETUP_SECRET env var to enable.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { setupSecret, email, password, name } = setupSchema.parse(body);

    if (setupSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const passwordHash = hashPassword(password);

    const existing = getAllUsers().find((u) => u.email === email);
    if (existing) {
      updateUser(existing.id, { role: 'admin' });
      return NextResponse.json({
        message: `User ${email} already exists — role upgraded to admin.`,
        userId: existing.id,
      });
    }

    const user = createUser(email, passwordHash, name, verificationToken);
    verifyUser(verificationToken);
    updateUser(user.id, { role: 'admin' });

    return NextResponse.json({
      message: `Admin account created for ${email}. You can now log in.`,
      userId: user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
