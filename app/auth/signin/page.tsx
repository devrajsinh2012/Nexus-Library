"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    fetch("/api/auth/setup-status", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setNeedsSetup(Boolean(data.needsSetup));
      })
      .catch(() => {
        setNeedsSetup(false);
      });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Sign in failed");
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold font-serif mb-2">Sign In</h1>
        <p className="text-sm text-muted-foreground mb-6">Welcome back to Nexus Library.</p>

        {needsSetup && (
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            No admin configured yet. <Link href="/auth/setup" className="underline font-medium">Setup first admin</Link>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary text-primary-foreground py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          New here? <Link href="/auth/signup" className="underline font-medium">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
