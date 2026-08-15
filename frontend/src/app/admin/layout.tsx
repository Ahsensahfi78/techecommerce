"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

import { AdminMobileNav, AdminSidebar } from "@/components/AdminSidebar";
import { Spinner } from "@/components/ui";
import { getToken, getUser } from "@/lib/api";
import type { User } from "@/lib/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const u = getUser() as User | null;
    if (!getToken() || !u || !u.is_admin) {
      router.replace(`/login?redirect=${encodeURIComponent("/admin")}`);
      return;
    }
    setUser(u);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <Spinner label="Checking permissions…" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin dashboard</h1>
          <p className="text-sm text-slate-500">
            Signed in as <span className="font-medium">{user.name}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">
          <AdminMobileNav />
          {children}
        </div>
      </div>
    </div>
  );
}
