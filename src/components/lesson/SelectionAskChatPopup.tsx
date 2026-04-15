'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExplainLevel } from '@/types/tutor';
import type { LearnerProfile } from '@/types/progress';
import { useTutorChat } from '@/hooks/useTutorChat';

export interface SelectionAnchor {
  x: number;
  y: number;
}

interface SelectionAskChatPopupProps {
  open: boolean;
  onClose: () => void;
  anchor: SelectionAnchor;
  selectedText: string;
  moduleId: string;
  moduleTitle: string;
  stepId: string;
  level?: ExplainLevel;
  learnerProfile: LearnerProfile;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function SelectionAskChatPopup({
  open,
  onClose,
  anchor,
  selectedText,
  moduleId,
  moduleTitle,
  stepId,
  level = 'standard',
  learnerProfile,
}: SelectionAskChatPopupProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, error, sendMessage, clearError } = useTutorChat({
    moduleId,
    moduleTitle,
    stepId,
    level,
    learnerProfile,
  });

  const wrapMessage = (userQuestion: string) => {
    const q = userQuestion.trim();
    const excerpt = selectedText.trim().slice(0, 6000);
    return `The learner selected this text from the page:\n"""${excerpt}"""\n\nQuestion: ${q}`;
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setInput('');
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    void sendMessage(wrapMessage(text));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const panelW = 380;
  const panelH = 480;
  const [pos, setPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const pad = 12;
    const left = clamp(anchor.x, pad, window.innerWidth - panelW - pad);
    const top = clamp(anchor.y, pad, window.innerHeight - panelH - pad);
    setPos({ left, top });
  }, [open, anchor.x, anchor.y]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <div
            role="presentation"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1999,
              background: 'rgba(0,0,0,0.35)',
            }}
            onClick={onClose}
            onContextMenu={(e) => e.preventDefault()}
          />
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{
              position: 'fixed',
              left: pos.left,
              top: pos.top,
              width: panelW,
              maxWidth: 'calc(100vw - 24px)',
              height: panelH,
              maxHeight: 'calc(100vh - 24px)',
              zIndex: 2000,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ask about selection
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {moduleTitle}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  padding: '0.2rem',
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
                maxHeight: '88px',
                overflowY: 'auto',
                flexShrink: 0,
                lineHeight: 1.45,
                background: 'rgba(99,102,241,0.06)',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Selected: </span>
              {selectedText.trim().slice(0, 500)}
              {selectedText.trim().length > 500 ? '…' : ''}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.75rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {messages.length === 0 && (
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Type a question about the highlighted text. The tutor sees your selection and module context.
                </p>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: '0.45rem',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      flexShrink: 0,
                    }}
                  >
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div
                    style={{
                      maxWidth: '86%',
                      padding: '0.45rem 0.65rem',
                      borderRadius:
                        msg.role === 'user' ? '10px 3px 10px 10px' : '3px 10px 10px 10px',
                      background:
                        msg.role === 'user' ? 'rgba(99,102,241,0.18)' : 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.8rem',
                      lineHeight: 1.55,
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

            {error && (
              <div
                style={{
                  margin: '0 0.85rem',
                  padding: '0.45rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  fontSize: '0.74rem',
                  color: '#fca5a5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            )}

            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '0.45rem',
                alignItems: 'flex-end',
                flexShrink: 0,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Your question…"
                rows={2}
                disabled={isStreaming}
                style={{
                  flex: 1,
                  resize: 'none',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.55rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.45,
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={isStreaming || !input.trim()}
                className="btn btn--primary btn--sm"
                style={{ flexShrink: 0, alignSelf: 'flex-end' }}
              >
                {isStreaming ? '…' : 'Send'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
