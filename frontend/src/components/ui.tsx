"use client";

import {
  createPortal,
} from "react-dom";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Minus,
  PackageOpen,
  Plus,
  SearchX,
  Star,
  X,
  XCircle,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Shared class strings                                                */
/* ------------------------------------------------------------------ */

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

export const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]";

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "dangerOutline"
  | "success";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20",
  secondary: "bg-slate-900 text-white hover:bg-slate-700",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20",
  dangerOutline: "border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  icon: "h-10 w-10",
};

export function buttonStyles(
  opts: {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    fullWidth?: boolean;
  } = {}
) {
  const {
    variant = "primary",
    size = "md",
    className,
    fullWidth,
  } = opts;
  return cx(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    fullWidth && "w-full",
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback: Spinner, Empty, Error, Alert                              */
/* ------------------------------------------------------------------ */

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Stars({
  rating,
  count,
  size = 14,
}: {
  rating?: number | null;
  count?: number;
  size?: number;
}) {
  const r = Math.round(rating ?? 0);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={
              i <= r ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
            }
            aria-hidden="true"
          />
        ))}
      </div>
      {rating ? (
        <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>
      ) : null}
      {count !== undefined && count > 0 && (
        <span className="text-xs text-slate-400">({count})</span>
      )}
    </div>
  );
}

export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  primary: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  error: "bg-rose-50 text-rose-700 ring-rose-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

export function Badge({
  text,
  tone = "neutral",
  className,
}: {
  text: string;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
        BADGE_TONES[tone],
        className
      )}
    >
      {text}
    </span>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
      <SearchX className="mx-auto h-8 w-8 text-rose-400" />
      <p className="mt-3 text-sm font-medium text-rose-700">{message}</p>
    </div>
  );
}

export function EmptyState({
  title,
  subtitle,
  action,
  icon,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
        {icon ?? <PackageOpen className="h-7 w-7" />}
      </span>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="max-w-sm text-sm text-slate-500">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "error";
  title?: string;
  children?: ReactNode;
}) {
  const styles = {
    info: "border-indigo-200 bg-indigo-50 text-indigo-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  };
  const icons = {
    info: <Info className="h-4 w-4" />,
    success: <Check className="h-4 w-4" />,
    warning: <AlertTriangle className="h-4 w-4" />,
    error: <XCircle className="h-4 w-4" />,
  };
  return (
    <div className={cx("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm", styles[tone])}>
      <span className="mt-0.5 shrink-0">{icons[tone]}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cx(title && "mt-0.5")}>{children}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}

export function SkeletonProductCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagination                                                          */
/* ------------------------------------------------------------------ */

export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) return null;

  const buttons: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      buttons.push(i);
    } else if (buttons[buttons.length - 1] !== "…") {
      buttons.push("…");
    }
  }

  const btnClass = (active: boolean) =>
    cx(
      "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-semibold transition-colors",
      active
        ? "bg-indigo-600 text-white"
        : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
    );

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className={cx(btnClass(false), "disabled:cursor-not-allowed disabled:opacity-40")}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {buttons.map((b, i) =>
        b === "…" ? (
          <span key={`dots-${i}`} className="px-1 text-sm text-slate-400">
            …
          </span>
        ) : (
          <button key={b} onClick={() => onPage(b)} className={btnClass(b === page)}>
            {b}
          </button>
        )
      )}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        className={cx(btnClass(false), "disabled:cursor-not-allowed disabled:opacity-40")}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, required, error, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      {label && (
        <span className={labelClass}>
          {label} {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cx(
        inputClass,
        invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
        className
      )}
    />
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cx(
        inputClass,
        "resize-none",
        invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
        className
      )}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cx(
        inputClass,
        "appearance-none bg-no-repeat pr-9",
        invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-100",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
        backgroundPosition: "right 0.5rem center",
        backgroundSize: "1.25rem",
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; description?: string }) {
  return (
    <label className={cx("flex cursor-pointer items-start gap-2.5", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
        {...props}
      />
      {(label || description) && (
        <span>
          {label && <span className="block text-sm font-medium text-slate-700">{label}</span>}
          {description && (
            <span className="block text-xs text-slate-500">{description}</span>
          )}
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Quantity stepper                                                    */
/* ------------------------------------------------------------------ */

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  size = "md",
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}) {
  const btnSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const clamp = (v: number) => Math.max(min, max === undefined ? v : Math.min(max, v));

  return (
    <div
      className={cx(
        "inline-flex items-center rounded-xl border border-slate-300 bg-white",
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        className={cx("grid place-items-center text-slate-500 hover:text-slate-900 disabled:opacity-40", btnSize)}
        aria-label="Decrease quantity"
      >
        <Minus className={iconSize} />
      </button>
      <span
        className={cx(
          "text-center text-sm font-semibold text-slate-900 tabular-nums",
          size === "sm" ? "w-8" : "w-10"
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || (max !== undefined && value >= max)}
        className={cx("grid place-items-center text-slate-500 hover:text-slate-900 disabled:opacity-40", btnSize)}
        aria-label="Increase quantity"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal + Drawer                                                      */
/* ------------------------------------------------------------------ */

function useScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useScrollLock(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : "Dialog"}
        className={cx(
          "animate-scale-in relative w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 text-base font-bold text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  side?: "left" | "right";
}) {
  const [mounted, setMounted] = useState(false);
  useScrollLock(open);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-slate-900/50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          "absolute top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl",
          side === "right" ? "right-0 animate-slide-in-right" : "left-0"
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0 text-base font-bold text-slate-900">{title}</div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cx("flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 no-scrollbar", className)}
      role="tablist"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
            active === t.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          )}
        >
          {t.label}
          {t.count !== undefined && (
            <span
              className={cx(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                active === t.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
              )}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string; onClick?: () => void }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        if (last || !item.href) {
          return (
            <span key={item.label} className="font-medium text-slate-500">
              {item.label}
            </span>
          );
        }
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            <a
              href={item.href}
              onClick={item.onClick}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              {item.label}
            </a>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          </span>
        );
      })}
    </nav>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tone = "indigo",
  sub,
  href,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone?: "indigo" | "emerald" | "amber" | "violet" | "cyan" | "rose";
  sub?: string;
  href?: string;
}) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    cyan: "bg-cyan-50 text-cyan-600",
    rose: "bg-rose-50 text-rose-600",
  };
  const Icon = icon;
  return (
    <div className={cx(cardClass, "p-5 transition-shadow hover:shadow-md", href && "cursor-pointer")}>
      <div className="flex items-center justify-between">
        <span className={cx("grid h-10 w-10 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        {href && (
          <ChevronRight className="h-4 w-4 text-slate-300" aria-hidden="true" />
        )}
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      {sub && <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>}
    </div>
  );
}

export function Progress({ value, tone = "indigo", className }: { value: number; tone?: "indigo" | "emerald" | "amber" | "rose"; className?: string }) {
  const tones = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };
  return (
    <div className={cx("h-2 overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cx("h-full rounded-full transition-all", tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export type { HTMLAttributes };
