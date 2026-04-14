'use client';

import { useState } from 'react';
import type { QuizItem } from '@/lib/ai/schemas';

export function AdaptiveQuizPanel({
  items,
  onAnswer,
}: {
  items: QuizItem[];
  onAnswer?: (item: QuizItem, selected: number, isCorrect: boolean) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const current = items[index];

  if (!current) return null;
  const showResult = selected !== null;
  const isCorrect = selected === current.answerIndex;

  return (
    <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: 'var(--bg-surface)' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem' }}>
        Adaptive quiz ({index + 1}/{items.length})
      </div>
      <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{current.question}</div>
      <div style={{ display: 'grid', gap: '0.35rem' }}>
        {current.options.map((option, optionIndex) => (
          <button
            key={`${current.id}-${optionIndex}`}
            onClick={() => {
              setSelected(optionIndex);
              onAnswer?.(current, optionIndex, optionIndex === current.answerIndex);
            }}
            className="btn btn--ghost btn--sm"
            style={{ justifyContent: 'flex-start' }}
          >
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: isCorrect ? 'var(--success)' : 'var(--text-secondary)' }}>
          {isCorrect ? 'Correct.' : 'Not quite.'} {current.explanation}
        </div>
      )}
      <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => {
            setSelected(null);
            setIndex((i) => Math.min(items.length - 1, i + 1));
          }}
          disabled={index >= items.length - 1}
        >
          Next quiz
        </button>
      </div>
    </div>
  );
}
