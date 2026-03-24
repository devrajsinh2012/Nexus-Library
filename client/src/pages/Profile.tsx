import { FormEvent, useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ShieldCheck, UserCircle2 } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/auth/signin?redirect=/profile";
    }
  }, [authLoading, isAuthenticated]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 4) {
      setError("New password must be at least 4 characters");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || "Failed to change password");
        return;
      }

      setMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isStaff = user.role === "admin" || user.role === "librarian";

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary grid place-items-center">
              <UserCircle2 className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your account details and password.</p>
            </div>
            {isStaff && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {user.role}
              </span>
            )}
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-muted-foreground">First Name</p>
              <p className="font-medium mt-1">{user.firstName || "-"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-muted-foreground">Last Name</p>
              <p className="font-medium mt-1">{user.lastName || "-"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:col-span-2">
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-bold mb-2">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-6">For security, enter your current password first.</p>

          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="text-sm font-medium" htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={4}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={4}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
