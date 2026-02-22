'use client';

import { useState } from 'react';

interface AuthorNoteProps {
  content: string;
}

export function AuthorNote({ content }: AuthorNoteProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          padding: '0.375rem 0',
          fontStyle: 'italic',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        💡 Author&apos;s Note
      </button>

      {expanded && (
        <div
          style={{
            padding: '0.75rem 1rem',
            paddingLeft: '1.25rem',
            borderLeft: '3px solid var(--accent-soft)',
            background: 'var(--bg-hover)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            marginTop: '0.25rem',
          }}
        >
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
