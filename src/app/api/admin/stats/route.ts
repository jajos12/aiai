import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/api/admin/content/_shared';
import { getAdminStatsSnapshot } from '@/lib/db/adminStats';

export async function GET(request: NextRequest) {
  try {
    const adminId = await requireAdmin(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    return NextResponse.json(getAdminStatsSnapshot());
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
