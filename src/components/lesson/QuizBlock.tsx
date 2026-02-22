'use client';

import { useState } from 'react';
import type { Quiz } from '@/types/curriculum';

interface QuizBlockProps {
  quiz: Quiz;
  existingAnswer?: number;
  onAnswer: (selectedIndex: number) => void;
}

export function QuizBlock({ quiz, existingAnswer, onAnswer }: QuizBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    existingAnswer ?? null,
  );
  const [submitted, setSubmitted] = useState(existingAnswer !== undefined);
  const isCorrect = selectedIndex === quiz.correctIndex;

  function handleSubmit() {
    if (selectedIndex === null) return;
    setSubmitted(true);
    onAnswer(selectedIndex);
  }

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${
          submitted
            ? isCorrect
              ? 'var(--success)'
              : 'var(--error)'
            : 'var(--border-default)'
        }`,
        background: 'var(--bg-surface)',
        transition: 'border-color var(--transition-fast)',
      }}
    >
      {/* Question */}
      <p
        style={{
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 0.75rem 0',
          fontFamily: 'var(--font-heading)',
        }}
      >
        ❓ {quiz.question}
      </p>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {quiz.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === quiz.correctIndex;

          let borderColor = 'var(--border-subtle)';
          let bg = 'var(--bg-base)';
          let textColor = 'var(--text-secondary)';

          if (submitted) {
            if (isCorrectOption) {
              borderColor = 'var(--success)';
              bg = 'rgba(16, 185, 129, 0.1)';
              textColor = 'var(--success)';
            } else if (isSelected && !isCorrectOption) {
              borderColor = 'var(--error)';
              bg = 'rgba(239, 68, 68, 0.1)';
              textColor = 'var(--error)';
            }
          } else if (isSelected) {
            borderColor = 'var(--accent)';
            bg = 'var(--accent-soft)';
            textColor = 'var(--accent)';
          }

          return (
            <button
              key={i}
              onClick={() => {
                if (!submitted) setSelectedIndex(i);
              }}
              disabled={submitted}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${borderColor}`,
                background: bg,
                cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left',
                fontSize: '0.875rem',
                color: textColor,
                transition: 'all var(--transition-fast)',
                width: '100%',
                fontFamily: 'inherit',
              }}
            >
              <span
                style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  borderRadius: '50%',
                  border: `2px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  flexShrink: 0,
                  background: isSelected ? borderColor : 'transparent',
                  color: isSelected ? 'white' : borderColor,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Submit button or feedback */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
          className="btn btn--primary btn--sm"
          style={{
            marginTop: '0.75rem',
            opacity: selectedIndex === null ? 0.5 : 1,
          }}
        >
          Check Answer
        </button>
      ) : (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: isCorrect
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isCorrect ? 'var(--success)' : 'var(--error)',
              margin: '0 0 0.25rem 0',
            }}
          >
            {isCorrect ? '✅ Correct!' : '❌ Not quite'}
          </p>
          <p
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {quiz.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
