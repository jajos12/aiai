import { requireAuthenticatedUserId } from '@/lib/auth/requireSession';

export default async function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticatedUserId();
  return <>{children}</>;
}
