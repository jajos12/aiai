import type { Metadata } from 'next';
import { MODULE_META } from '@/content/registry';

type Props = {
  params: Promise<{ tierId: string; moduleId: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  const meta = MODULE_META.find((m) => m.id === moduleId);

  if (!meta) {
    return { title: moduleId };
  }

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | AI Playground`,
      description: meta.description,
    },
  };
}

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
