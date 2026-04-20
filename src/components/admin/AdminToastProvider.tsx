'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastKind = 'ok' | 'err' | 'info';

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const ToastContext = createContext<{
  showToast: (message: string, kind?: ToastKind) => void;
} | null>(null);

export function useAdminToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: (_m: string, _k?: ToastKind) => {} };
  }
  return ctx;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const t = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4200);
    return () => clearTimeout(t);
  }, [toasts]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-[200] flex max-w-md flex-col gap-2 sm:left-auto sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto px-4 py-3 rounded-lg text-sm shadow-lg border"
            style={{
              background: 'var(--bg-surface)',
              borderColor:
                t.kind === 'ok'
                  ? 'rgba(34, 197, 94, 0.45)'
                  : t.kind === 'err'
                    ? 'rgba(239, 68, 68, 0.45)'
                    : 'var(--border-subtle)',
              color: t.kind === 'err' ? 'var(--color-error)' : 'var(--text-primary)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
