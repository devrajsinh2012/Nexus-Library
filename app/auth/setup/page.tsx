"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function SetupFirstAdminPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/setup-status", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (!data.needsSetup) {
          router.replace("/auth/signin");
          return;
        }
      })
      .finally(() => setChecking(false));
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/setup-first-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Failed to setup first admin");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Failed to setup first admin");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <main className="min-h-screen grid place-items-center text-sm text-muted-foreground">Checking setup status...</main>;
  }

  return (
    <main className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold font-serif mb-2">First Admin Setup</h1>
        <p className="text-sm text-muted-foreground mb-6">Create the first administrator account for Nexus Library.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium" htmlFor="firstName">First name</label>
              <input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

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
              minLength={4}
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
            {loading ? "Setting up..." : "Create First Admin"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Back to <Link href="/auth/signin" className="underline font-medium">sign in</Link>
        </p>
      </div>
    </main>
  );
}
