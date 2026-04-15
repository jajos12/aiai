import { NextRequest, NextResponse } from 'next/server';
import { getModuleData, getModuleIds } from '@/core/registry';
import { getContentModuleData, upsertContentModule } from '@/lib/db/content';
import { requireAdmin } from '../_shared';

export async function POST(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const moduleIds = getModuleIds();
    const warnings: string[] = [];
    let migrated = 0;

    for (const moduleId of moduleIds) {
      const moduleData = await getModuleData(moduleId);
      if (!moduleData) {
        warnings.push(`Skipped ${moduleId}: module data missing`);
        continue;
      }

      upsertContentModule(moduleData, adminId, 'draft');
      const fromDb = getContentModuleData(moduleData.id);
      if (!fromDb) {
        warnings.push(`Warning ${moduleId}: readback failed`);
        continue;
      }
      if (moduleData.steps.length !== fromDb.steps.length) {
        warnings.push(
          `Warning ${moduleId}: step parity mismatch ${moduleData.steps.length} -> ${fromDb.steps.length}`,
        );
      }
      migrated += 1;
    }

    return NextResponse.json({
      message: 'Migration complete',
      migrated,
      totalCandidates: moduleIds.length,
      warnings,
    });
  } catch (error) {
    console.error('Admin content migration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
