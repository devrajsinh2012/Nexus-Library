"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || "Sign up failed");
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/20 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold font-serif mb-2">Create Account</h1>
        <p className="text-sm text-muted-foreground mb-6">Join Nexus Library.</p>

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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted-foreground">
          Already have an account? <Link href="/auth/signin" className="underline font-medium">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
