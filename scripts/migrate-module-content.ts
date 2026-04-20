import { getModuleData, getModuleIds } from '@/core/registry';
import { upsertContentModule, getContentModuleData } from '@/lib/db/content';

function summarizeParity(moduleId: string, sourceSteps: number, targetSteps: number): string {
  if (sourceSteps !== targetSteps) {
    return `WARN ${moduleId}: step mismatch source=${sourceSteps}, target=${targetSteps}`;
  }
  return `OK   ${moduleId}: ${sourceSteps} steps`;
}

async function migrate(): Promise<void> {
  const ids = getModuleIds();
  let migratedCount = 0;
  let warnings = 0;

  for (const moduleId of ids) {
    const moduleData = await getModuleData(moduleId);
    if (!moduleData) {
      console.warn(`SKIP ${moduleId}: no module data`);
      continue;
    }

    upsertContentModule(moduleData, undefined, 'draft');
    const fromDb = getContentModuleData(moduleData.id);
    if (!fromDb) {
      warnings += 1;
      console.warn(`WARN ${moduleId}: DB readback failed after upsert`);
      continue;
    }

    console.log(summarizeParity(moduleId, moduleData.steps.length, fromDb.steps.length));
    if (moduleData.steps.length !== fromDb.steps.length) warnings += 1;
    migratedCount += 1;
  }

  console.log(`Migration complete. Migrated=${migratedCount}, warnings=${warnings}, totalCandidates=${ids.length}`);
}

migrate().catch((error) => {
  console.error('Content migration failed:', error);
  process.exit(1);
});
