'use client';

import { useState, useMemo } from 'react';
import type { GoDeeper as GoDeeperType } from '@/types/curriculum';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface GoDeeperProps {
  data: GoDeeperType;
  defaultExpanded?: boolean;
}

export function GoDeeper({ data, defaultExpanded = false }: GoDeeperProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Render LaTeX to HTML string (memoized)
  const mathHtml = useMemo(() => {
    if (!data.math) return '';
    try {
      return katex.renderToString(data.math, {
        displayMode: true,
        throwOnError: false,
        trust: true,
      });
    } catch {
      return data.math; // Fallback to raw string
    }
  }, [data.math]);

  return (
    <div
      style={{
        marginTop: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        transition: 'border-color var(--transition-fast)',
      }}
    >
      {/* Trigger */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'var(--bg-hover)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--accent)',
          fontFamily: 'var(--font-heading)',
          textAlign: 'left',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-soft)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-hover)';
        }}
      >
        <span
          style={{
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}
        >
          ▸
        </span>
        Go Deeper
      </button>

      {/* Content */}
      {expanded && (
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-base)',
          }}
        >
          {/* Math block — rendered with KaTeX */}
          {data.math && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'var(--bg-hover)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.75rem',
                overflowX: 'auto',
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ __html: mathHtml }}
            />
          )}

          {/* Explanation */}
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {data.explanation}
          </p>

          {/* References */}
          {data.references && data.references.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Further Reading
              </span>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0.25rem 0 0 0',
                }}
              >
                {data.references.map((ref, i) => (
                  <li key={i} style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--accent)',
                          textDecoration: 'none',
                        }}
                      >
                        {ref.title}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>{ref.title}</span>
                    )}
                    <span style={{ color: 'var(--text-muted)' }}>
                      {' '}
                      — {ref.author}
                      {ref.year ? ` (${ref.year})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
