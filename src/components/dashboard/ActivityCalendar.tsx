'use client';

/** Mini activity calendar (GitHub contribution graph style) */
export function ActivityCalendar() {
  // Generate last 12 weeks of placeholder data
  const weeks = 12;
  const daysPerWeek = 7;

  const cells: { date: string; level: 0 | 1 | 2 | 3 | 4 }[] = [];
  const today = new Date();

  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < daysPerWeek; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      cells.push({
        date: date.toISOString().split('T')[0],
        level: 0, // No activity yet
      });
    }
  }

  const levelColors = [
    'var(--bg-hover)',           // 0: no activity
    'var(--tier-0-soft)',        // 1: light
    'rgba(16, 185, 129, 0.3)',  // 2: medium
    'rgba(16, 185, 129, 0.5)',  // 3: high
    'var(--tier-0)',             // 4: max
  ];

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)',
          margin: '0 0 0.75rem 0',
        }}
      >
        📅 Activity
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks}, 1fr)`,
          gridTemplateRows: `repeat(${daysPerWeek}, 1fr)`,
          gap: '3px',
        }}
      >
        {cells.map((cell, i) => (
          <div
            key={i}
            title={cell.date}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '2px',
              background: levelColors[cell.level],
              minWidth: '10px',
              minHeight: '10px',
            }}
          />
        ))}
      </div>
    </div>
  );
}
