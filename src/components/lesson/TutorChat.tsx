'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ExplainLevel } from '@/types/tutor';
import type { LearnerProfile } from '@/types/progress';
import { useTutorChat } from '@/hooks/useTutorChat';

const WIDTH_STORAGE_KEY = 'aiai_tutor_chat_width';
const MIN_WIDTH = 280;
const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 360;

const QUICK_ACTIONS = [
  'Explain this step simply',
  'Give me a practice question',
  'Why does this matter?',
  'Connect this to what I learned before',
];

function readStoredWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_WIDTH;
  try {
    const raw = sessionStorage.getItem(WIDTH_STORAGE_KEY);
    if (!raw) return DEFAULT_WIDTH;
    const n = Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_WIDTH;
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(n)));
  } catch {
    return DEFAULT_WIDTH;
  }
}

interface TutorChatProps {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  moduleTitle: string;
  stepId: string;
  level: ExplainLevel;
  learnerProfile: LearnerProfile;
}

export function TutorChat({
  open,
  onClose,
  moduleId,
  moduleTitle,
  stepId,
  level,
  learnerProfile,
}: TutorChatProps) {
  const [input, setInput] = useState('');
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const panelWidthRef = useRef(DEFAULT_WIDTH);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragRef = useRef<{ startX: number; startW: number } | null>(null);

  const { messages, isStreaming, error, sendMessage, clearError } = useTutorChat({
    moduleId,
    moduleTitle,
    stepId,
    level,
    learnerProfile,
  });

  useEffect(() => {
    panelWidthRef.current = panelWidth;
  }, [panelWidth]);

  useEffect(() => {
    if (open) {
      const w = readStoredWidth();
      panelWidthRef.current = w;
      setPanelWidth(w);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const delta = drag.startX - e.clientX;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, drag.startW + delta));
      panelWidthRef.current = next;
      setPanelWidth(next);
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      try {
        sessionStorage.setItem(WIDTH_STORAGE_KEY, String(panelWidthRef.current));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const onResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { startX: e.clientX, startW: panelWidthRef.current };
  }, []);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            position: 'fixed',
            top: 'var(--topnav-height)',
            right: 0,
            bottom: 0,
            width: panelWidth,
            maxWidth: '96vw',
            background: 'var(--bg-surface)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
          }}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize AI tutor panel"
            onPointerDown={onResizePointerDown}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 8,
              cursor: 'ew-resize',
              zIndex: 2,
              touchAction: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-elevated)',
              flexShrink: 0,
              paddingLeft: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <span style={{ fontSize: '1rem' }}>🤖</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  AI Tutor
                </div>
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {moduleTitle}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.1rem',
                padding: '0.25rem',
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Close AI Tutor"
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem 1rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🎓</div>
                <p style={{ margin: 0 }}>
                  Ask me anything about this step. I know the context of the current lesson.
                </p>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.72rem', opacity: 0.85 }}>
                  Drag the left edge to widen or narrow this panel.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  gap: '0.5rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '0.6rem 0.8rem',
                    borderRadius:
                      msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                    background:
                      msg.role === 'user'
                        ? 'rgba(99,102,241,0.18)'
                        : 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.855rem',
                    lineHeight: 1.65,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content || (
                    <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Thinking…</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length === 0 && (
            <div
              style={{
                padding: '0 1rem 0.75rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                flexShrink: 0,
              }}
            >
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  disabled={isStreaming}
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border-default)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div
              style={{
                margin: '0 1rem 0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                fontSize: '0.78rem',
                color: '#fca5a5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <span>{error}</span>
              <button
                onClick={clearError}
                style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            </div>
          )}

          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question… (Enter to send)"
              rows={2}
              disabled={isStreaming}
              style={{
                flex: 1,
                resize: 'none',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.855rem',
                padding: '0.5rem 0.65rem',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="btn btn--primary btn--sm"
              style={{ flexShrink: 0, alignSelf: 'flex-end' }}
            >
              {isStreaming ? '…' : '↑'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
