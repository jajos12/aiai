export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-surface)',
        transition: 'background var(--transition-slow), border-color var(--transition-slow)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        <span>🧠</span>
        <span>AI Learning Playground</span>
        <span style={{ color: 'var(--border-default)' }}>·</span>
        <span>Learn AI visually</span>
      </div>
    </footer>
  );
}
