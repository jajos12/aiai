'use client';

import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { TierCard } from '@/components/dashboard/TierCard';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { ActivityCalendar } from '@/components/dashboard/ActivityCalendar';

// Placeholder tier data (will be replaced by real curriculum data)
const TIERS = [
  {
    id: 0,
    title: 'Mathematical Foundations',
    emoji: '🟢',
    description: 'Vectors, matrices, calculus, probability — the building blocks of everything in AI.',
    moduleCount: 13,
    completedModules: 0,
    isUnlocked: true,
  },
  {
    id: 1,
    title: 'ML Fundamentals',
    emoji: '🔵',
    description: 'Linear regression, gradient descent, classification — your first ML algorithms.',
    moduleCount: 12,
    completedModules: 0,
    isUnlocked: false,
    unlockRequirement: 'Complete 70% of Tier 0 to unlock',
  },
  {
    id: 2,
    title: 'Deep Learning Core',
    emoji: '🟣',
    description: 'Neural networks, backpropagation, CNNs — the deep learning revolution.',
    moduleCount: 12,
    completedModules: 0,
    isUnlocked: false,
    unlockRequirement: 'Complete 70% of Tier 1 to unlock',
  },
  {
    id: 3,
    title: 'Advanced Architectures',
    emoji: '🟡',
    description: 'Transformers, attention, generative models — cutting-edge architectures.',
    moduleCount: 15,
    completedModules: 0,
    isUnlocked: false,
    unlockRequirement: 'Complete 70% of Tier 2 to unlock',
  },
  {
    id: 4,
    title: 'Frontiers & Applications',
    emoji: '🔴',
    description: 'Reinforcement learning, multimodal AI, emergence — the frontier.',
    moduleCount: 15,
    completedModules: 0,
    isUnlocked: false,
    unlockRequirement: 'Complete 70% of Tier 3 to unlock',
  },
  {
    id: 5,
    title: 'Research & Open Problems',
    emoji: '🟤',
    description: 'Alignment, scaling laws, open problems — where the field is headed.',
    moduleCount: 15,
    completedModules: 0,
    isUnlocked: false,
    unlockRequirement: 'Complete 70% of Tier 4 to unlock',
  },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div
      className="bg-mesh"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 1.5rem',
          width: '100%',
        }}
      >
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }} className="animate-fade-in">
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome to AI Playground
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              margin: 0,
              maxWidth: '600px',
            }}
          >
            Learn AI concepts from the ground up through interactive visualizations.
            No prerequisites — just curiosity.
          </p>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}
          className="animate-fade-in"
        >
          <StreakCounter />
          <ActivityCalendar />
        </div>

        {/* Learning Path Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Learning Path
          </h2>
          <button
            className="btn btn--ghost btn--sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            🗺️ Roadmap View
          </button>
        </div>

        {/* Tier Cards Grid */}
        <div
          className="stagger-children responsive-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1rem',
          }}
        >
          {TIERS.map((tier, i) => (
            <div
              key={tier.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <TierCard
                {...tier}
                onClick={() => router.push(`/tier/${tier.id}`)}
              />
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
