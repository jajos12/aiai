'use client';

import { useState } from 'react';
import type { Flashcard } from '@/lib/ai/schemas';

export function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];

  if (!card) return null;

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: 'var(--bg-surface)' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>
        Flashcards ({index + 1}/{cards.length})
      </div>
      <button
        onClick={() => setFlipped((v) => !v)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'var(--bg-base)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          color: 'var(--text-primary)',
          cursor: 'pointer',
        }}
      >
        {flipped ? card.back : card.front}
      </button>
      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn btn--ghost btn--sm" onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}>
          Prev
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => { setIndex((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}>
          Next
        </button>
      </div>
    </div>
  );
}
