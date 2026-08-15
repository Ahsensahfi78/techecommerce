"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: { title: string; message?: string; variant?: ToastVariant }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  error: <XCircle className="h-5 w-5 text-rose-600" />,
  info: <Info className="h-5 w-5 text-indigo-600" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
};

const STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-200",
  error: "border-rose-200",
  info: "border-indigo-200",
  warning: "border-amber-200",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: (t) =>
        push({ title: t.title, message: t.message, variant: t.variant ?? "info" }),
      success: (title, message) => push({ title, message, variant: "success" }),
      error: (title, message) => push({ title, message, variant: "error" }),
      info: (title, message) => push({ title, message, variant: "info" }),
      warning: (title, message) => push({ title, message, variant: "warning" }),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast viewport */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-16 z-[90] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:top-20 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${STYLES[t.variant]} bg-white p-3.5 shadow-lg shadow-slate-900/5`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.variant]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                  {t.message}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
