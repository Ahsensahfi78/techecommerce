import { handleMockApi } from "./mock-data";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function assetUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("/")) return `${API_URL}${url}`;
  return url;
}

export const TOKEN_KEY = "shopease_token";
export const USER_KEY = "shopease_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: Record<string, unknown>) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("shopease-auth-changed"));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("shopease-auth-changed"));
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = "GET", body, auth = false } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Backend unreachable (e.g. static demo deploy) — serve built-in sample data.
    try {
      return await handleMockApi<T>(path, method, body);
    } catch (mockErr) {
      const status = (mockErr as { status?: number }).status ?? 0;
      const message = mockErr instanceof Error ? mockErr.message : "Request failed";
      throw new ApiError(status, message);
    }
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = (data as { detail?: string } | null)?.detail;
    throw new ApiError(
      res.status,
      typeof detail === "string" ? detail : "Request failed"
    );
  }

  return data as T;
}

export async function apiUpload(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers,
      body: fd,
    });
  } catch {
    // Demo mode: pretend the upload succeeded so forms stay usable offline.
    return { url: "" };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data as { detail?: string } | null)?.detail ?? "Upload failed"
    );
  }
  return data as { url: string };
}
