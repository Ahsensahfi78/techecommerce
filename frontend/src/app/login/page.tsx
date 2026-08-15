"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";

import { api, ApiError, setSession } from "@/lib/api";
import type { User } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ access_token: string; user: User }>(
        "/api/auth/login",
        { method: "POST", body: { email, password } }
      );
      setSession(res.access_token, res.user as unknown as Record<string, unknown>);
      router.push(res.user.is_admin ? redirect : redirect);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to continue shopping with us.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500">
          <p>
            <span className="font-semibold">Demo admin:</span>{" "}
            admin@shopease.com / admin123
          </p>
          <p className="mt-1">
            <span className="font-semibold">Demo user:</span> demo@shopease.com /
            demo123
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirect)}`}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-sm text-slate-400">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
