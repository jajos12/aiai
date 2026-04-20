import { requireAuthenticatedUserId } from '@/lib/auth/requireSession';

export default async function TierSectionLayout({ children }: { children: React.ReactNode }) {
  await requireAuthenticatedUserId();
  return <>{children}</>;
}
