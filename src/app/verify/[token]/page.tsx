import { redirect } from 'next/navigation';

export default async function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/verify?token=${encodeURIComponent(token)}`);
}
