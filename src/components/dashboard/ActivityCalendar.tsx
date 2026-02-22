'use client';

import { useMemo } from 'react';
import { useProgress } from '@/hooks/useProgress';

/** Mini activity calendar (GitHub contribution graph style) */
export function ActivityCalendar() {
  const { stats, isLoaded } = useProgress();

  const weeks = 12;
  const daysPerWeek = 7;

  // Build a map of date → event count from real activity log
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!isLoaded) return map;
    for (const entry of stats.activityLog) {
      map[entry.date] = (map[entry.date] || 0) + 1;
    }
    return map;
  }, [stats.activityLog, isLoaded]);

  // Generate cells for last 12 weeks
  const cells = useMemo(() => {
    const result: { date: string; level: 0 | 1 | 2 | 3 | 4 }[] = [];
    const today = new Date();

    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < daysPerWeek; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap[dateStr] || 0;

        // Map count to level (0-4)
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count >= 8) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;

        result.push({ date: dateStr, level });
      }
    }
    return result;
  }, [activityMap]);

  const levelColors = [
    'var(--bg-hover)',           // 0: no activity
    'rgba(99, 102, 241, 0.2)',  // 1: light (accent-tinted)
    'rgba(99, 102, 241, 0.35)', // 2: medium
    'rgba(99, 102, 241, 0.55)', // 3: high
    'rgba(99, 102, 241, 0.8)',  // 4: max
  ];

  const totalToday = activityMap[new Date().toISOString().split('T')[0]] || 0;

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            margin: 0,
          }}
        >
          📅 Activity
        </h3>
        {totalToday > 0 && (
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--accent)',
              background: 'var(--accent-soft)',
              padding: '0.125rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {totalToday} today
          </span>
        )}
      </div>
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
            title={`${cell.date}: ${activityMap[cell.date] || 0} activities`}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '2px',
              background: levelColors[cell.level],
              minWidth: '10px',
              minHeight: '10px',
              transition: 'background 0.2s ease',
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginTop: '0.5rem',
          justifyContent: 'flex-end',
        }}
      >
        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
          Less
        </span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '2px',
              background: color,
            }}
          />
        ))}
        <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
          More
        </span>
      </div>
    </div>
  );
}
