import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import { authOptions } from '@/lib/auth/authjs';
import { getUserById } from '@/lib/db/users';
import { hasAdminAccess } from '@/lib/auth/adminEnv';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id ?? 0);
  if (!Number.isInteger(userId) || userId <= 0) {
    redirect('/login');
  }

  const user = getUserById(userId);
  if (!user || !hasAdminAccess(user.email, user.role)) {
    redirect('/');
  }

  return (
    <AdminLayout user={{ name: user.name, email: user.email, role: user.role }}>
      {children}
    </AdminLayout>
  );
}
