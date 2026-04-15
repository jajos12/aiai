'use client';

import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { TierCard } from '@/components/dashboard/TierCard';
import { getTierSummaries } from '@/core/curriculum';

export default function HomePage() {
  const router = useRouter();
  const tiers = getTierSummaries();

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
            No prerequisites - just curiosity.
          </p>
        </div>

        <div
          className="animate-fade-in"
          style={{
            marginBottom: '1.25rem',
            padding: '1rem 1.25rem',
            border: '1px solid var(--accent-soft)',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.2rem' }}>
              Personalized dashboard
            </div>
            <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              View your learning analytics and recommendations
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              We moved all personalization features into a dedicated page.
            </div>
          </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => router.push('/dashboard')}
            >
              Open dashboard
            </button>
          </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
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
        </div>

        <div
          className="stagger-children responsive-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1rem',
          }}
        >
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
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
