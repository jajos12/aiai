import type { Metadata } from 'next';

const TIER_TITLES: Record<number, string> = {
  0: 'Mathematical Foundations',
  1: 'ML Fundamentals',
  2: 'Deep Learning Core',
  3: 'Advanced Architectures',
  4: 'Frontiers & Applications',
  5: 'Research & Open Problems',
};

const TIER_DESCRIPTIONS: Record<number, string> = {
  0: 'Vectors, matrices, calculus, probability — the building blocks of everything in AI.',
  1: 'Linear regression, gradient descent, classification — the core algorithms.',
  2: 'Neural networks, backpropagation, CNNs — the deep learning revolution.',
  3: 'Transformers, attention, generative models — state of the art.',
  4: 'Reinforcement learning, multimodal AI, emergence — the cutting edge.',
  5: 'Alignment, scaling laws, open problems — the frontier.',
};

type Props = {
  params: Promise<{ tierId: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tierId } = await params;
  const id = Number(tierId);
  const title = TIER_TITLES[id] ?? `Tier ${id}`;
  const description = TIER_DESCRIPTIONS[id] ?? `Explore Tier ${id} modules on AI Playground.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | AI Playground`,
      description,
    },
  };
}

export default function TierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
