import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestSession } from '@/lib/auth/session';
import { effectiveSessionRole } from '@/lib/auth/adminEnv';
import { getUserById, updateUser, getUserPreferences, upsertUserPreferences, getUserProgress } from '@/lib/db/users';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    learning_goal: z.string().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await validateRequestSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    const dbUser = getUserById(userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const preferences = getUserPreferences(userId);
    const progress = getUserProgress(userId);

    return NextResponse.json({
      user: {
        id: userId,
        email: dbUser.email,
        name: dbUser.name,
        role: effectiveSessionRole(dbUser.email, dbUser.role ?? 'user'),
        createdAt: dbUser.created_at ?? null,
      },
      preferences: preferences || null,
      progress,
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await validateRequestSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const updates = updateSchema.parse(body);

    if (updates.name) {
      updateUser(userId, { name: updates.name });
    }

    if (updates.preferences) {
      upsertUserPreferences(userId, updates.preferences);
    }

    const user = getUserById(userId);
    const preferences = getUserPreferences(userId);

    return NextResponse.json({
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: effectiveSessionRole(user!.email, user!.role ?? 'user'),
      },
      preferences: preferences || null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid request payload' },
        { status: 400 }
      );
    }
    console.error('Me PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}