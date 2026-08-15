export function formatPrice(value: number): string {
  return `Rs ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  paid: "bg-blue-100 text-blue-800 ring-blue-200",
  shipped: "bg-violet-100 text-violet-800 ring-violet-200",
  delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 ring-rose-200",
};
