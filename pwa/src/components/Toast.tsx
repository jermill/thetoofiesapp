import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ToofieSprite } from '../components/ToofieSprite';

export type ToastTone = 'default' | 'good' | 'soft';

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  anim?: string;
  leaving?: boolean;
};

type ToastApi = {
  show: (message: string, opts?: { tone?: ToastTone; anim?: string; ms?: number }) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    window.setTimeout(() => {
      setItems((list) => list.filter((t) => t.id !== id));
    }, 280);
  }, []);

  const show = useCallback(
    (message: string, opts?: { tone?: ToastTone; anim?: string; ms?: number }) => {
      const id = ++idRef.current;
      const tone = opts?.tone ?? 'default';
      const anim = opts?.anim;
      const ms = opts?.ms ?? 2200;
      setItems((list) => [...list.filter((t) => !t.leaving).slice(-2), { id, message, tone, anim }]);
      window.setTimeout(() => dismiss(id), ms);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.tone}${t.leaving ? ' toast-out' : ''}${t.anim ? ' toast-with-mascot' : ''}`}
            role="status"
          >
            {t.anim && (
              <ToofieSprite
                anim={t.anim}
                size={44}
                className="toast-mascot"
                motion="task"
                loop={false}
                tappable={false}
              />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
