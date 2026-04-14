import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateSession } from '@/lib/auth/session';
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
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = await validateSession(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = getUserPreferences(userId);
    const progress = getUserProgress(userId);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
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
    const token = request.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = await validateSession(token);
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
        role: user!.role,
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