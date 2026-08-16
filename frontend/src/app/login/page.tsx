"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";

import { api, ApiError, setSession } from "@/lib/api";
import type { User } from "@/lib/types";
import { Alert, Button, Field, Input } from "@/components/ui";

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
    <div className="mx-auto grid max-w-4xl px-4 py-16 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between overflow-hidden rounded-l-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Tech<span className="text-indigo-200">Mos</span>
          </span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold leading-snug">
            Welcome back to the world of smart shopping.
          </h2>
          <p className="mt-3 text-sm text-indigo-100">
            Track orders, save favourites and checkout faster with your TechMos
            account.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-indigo-100">
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Order tracking in real time
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Exclusive deals &amp; coupons
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> One-tap reordering
            </li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/[0.02] lg:rounded-l-none">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to continue shopping with us.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>

          {error && <Alert tone="error">{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            loadingLabel="Signing in…"
          >
            Sign in
          </Button>
        </form>

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
