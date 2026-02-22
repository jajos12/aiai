'use client';

import type { Step } from '@/types/curriculum';

interface LessonSidebarProps {
  steps: Step[];
  currentStepIndex: number;
  completedSteps: Set<string>;
  onSelectStep: (index: number) => void;
  moduleTitle: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile drawer state */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function LessonSidebar({
  steps,
  currentStepIndex,
  completedSteps,
  onSelectStep,
  moduleTitle,
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
}: LessonSidebarProps) {

  // ── Shared step list renderer ──
  function renderStepList(onStepClick?: () => void) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 0.5rem' }}>
        {steps.map((step, i) => {
          const isActive = i === currentStepIndex;
          const isComplete = completedSteps.has(step.id);
          return (
            <button
              key={step.id}
              onClick={() => {
                onSelectStep(i);
                onStepClick?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                width: '100%',
                padding: '0.5rem 0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background var(--transition-fast)',
                marginBottom: '0.125rem',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '50%',
                  border: isComplete
                    ? 'none'
                    : `2px solid ${isActive ? 'var(--accent)' : 'var(--border-default)'}`,
                  background: isComplete
                    ? 'var(--success)'
                    : isActive
                      ? 'var(--accent)'
                      : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.5625rem',
                  fontWeight: 700,
                  color: isComplete || isActive ? 'white' : 'var(--text-muted)',
                  flexShrink: 0,
                  marginTop: '0.125rem',
                }}
              >
                {isComplete ? '✓' : i + 1}
              </span>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive
                    ? 'var(--accent)'
                    : 'var(--text-secondary)',
                  lineHeight: 1.4,
                }}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Shared progress bar renderer ──
  function renderProgress() {
    return (
      <div style={{ padding: '0.75rem 1rem 0.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.375rem',
          }}
        >
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Progress
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            {completedSteps.size}/{steps.length}
          </span>
        </div>
        <div
          style={{
            height: '4px',
            borderRadius: '2px',
            background: 'var(--bg-hover)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(completedSteps.size / steps.length) * 100}%`,
              borderRadius: '2px',
              background: 'var(--accent)',
              transition: 'width var(--transition-base)',
            }}
          />
        </div>
      </div>
    );
  }

  // ── Mobile Drawer ──
  const mobileDrawer = mobileOpen ? (
    <>
      <div className="sidebar-drawer-backdrop" onClick={onMobileClose} />
      <div className="sidebar-drawer">
        <button className="sidebar-drawer-close" onClick={onMobileClose} aria-label="Close menu">
          ✕
        </button>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {moduleTitle}
          </h3>
        </div>
        {renderProgress()}
        {renderStepList(() => onMobileClose?.())}
      </div>
    </>
  ) : null;
  if (collapsed) {
    return (
      <>
        {mobileDrawer}
        <div
          className="desktop-sidebar"
          style={{
            width: '3rem',
            height: '100%',
            background: 'var(--bg-surface)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '1rem',
            transition: 'width var(--transition-base)',
          }}
        >
          <button
            onClick={onToggleCollapse}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Expand sidebar"
          >
            ☰
          </button>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              marginTop: '1rem',
            }}
          >
            {steps.map((step, i) => {
              const isActive = i === currentStepIndex;
              const isComplete = completedSteps.has(step.id);
              return (
                <button
                  key={step.id}
                  onClick={() => onSelectStep(i)}
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    background: isActive
                      ? 'var(--accent)'
                      : isComplete
                        ? 'var(--success)'
                        : 'var(--border-default)',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isActive ? '0 0 6px var(--accent)' : 'none',
                  }}
                  title={`Step ${i + 1}: ${step.title}`}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {mobileDrawer}
      <div
        className="desktop-sidebar"
        style={{
          width: '280px',
          height: '100%',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width var(--transition-base)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {moduleTitle}
          </h3>
          <button
            onClick={onToggleCollapse}
            style={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Collapse sidebar"
          >
            ✕
          </button>
        </div>

        {renderProgress()}
        {renderStepList()}
      </div>
    </>
  );
}
