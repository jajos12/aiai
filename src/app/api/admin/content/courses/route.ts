import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteCourse, listCourseHierarchy, replaceCourseStructure, upsertCourse } from '@/lib/db/content';
import { requireAdmin } from '../_shared';

const courseSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  subtitle: z.string().optional(),
  learningOutcomes: z.array(z.string()).optional(),
  audienceText: z.string().optional(),
  prerequisitesText: z.string().optional(),
  coverImageUrl: z.string().optional(),
  introVideoUrl: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  sortOrder: z.number().optional(),
  sections: z
    .array(
      z.object({
        sectionId: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
        modules: z
          .array(
            z.object({
              moduleId: z.string().min(1),
              sortOrder: z.number().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
}).superRefine((course, ctx) => {
  const sections = course.sections ?? [];
  const totalModules = sections.reduce((count, section) => count + (section.modules?.length ?? 0), 0);
  if (totalModules === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A course must include at least one module assigned to a section.',
      path: ['sections'],
    });
  }
});

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ courses: listCourseHierarchy() });
  } catch (error) {
    console.error('Admin list courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const payload = courseSchema.parse(await request.json());
    upsertCourse(payload);
    if (payload.sections) {
      replaceCourseStructure({
        courseId: payload.courseId,
        sections: payload.sections,
      });
    }
    return NextResponse.json({ message: 'Course saved' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
    }
    console.error('Admin upsert course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId') ?? '';
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }
    const ok = deleteCourse(courseId);
    if (!ok) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ message: 'Course deleted' });
  } catch (error) {
    console.error('Admin delete course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
