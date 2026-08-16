"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ShoppingBag, Sparkles } from "lucide-react";

import { api, ApiError, setSession } from "@/lib/api";
import type { User } from "@/lib/types";
import { Alert, Button, Field, Input } from "@/components/ui";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api<{ access_token: string; user: User }>(
        "/api/auth/register",
        {
          method: "POST",
          body: { name: form.name, email: form.email, password: form.password },
        }
      );
      setSession(res.access_token, res.user as unknown as Record<string, unknown>);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Registration failed. Please try again."
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
            Join thousands of smart shoppers.
          </h2>
          <p className="mt-3 text-sm text-indigo-100">
            Create a free account and unlock a faster, more personal shopping
            experience.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-indigo-100">
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Save wishlists &amp; reorder
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Track orders in real time
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Exclusive member deals
            </li>
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/[0.02] lg:rounded-l-none">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Join TechMos and start shopping in minutes.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Full name" required>
            <Input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="John Doe"
              autoComplete="name"
            />
          </Field>
          <Field label="Email" required>
            <Input
              required
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Password" required hint="At least 6 characters">
            <Input
              required
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </Field>
          <Field label="Confirm password" required>
            <Input
              required
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
          </Field>

          {error && <Alert tone="error">{error}</Alert>}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            loadingLabel="Creating account…"
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20 text-sm text-slate-400">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
