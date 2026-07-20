"use client";

import { useState, Suspense } from "react";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const { data: session, update } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"credentials" | "2fa">("credentials");

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Check session for 2FA requirement
      // We need to refresh the session to get the latest data
      const updatedSession = await update();
      const needs2fa =
        updatedSession?.user?.twoFactorRequired &&
        !updatedSession?.user?.twoFactorVerified;

      if (needs2fa) {
        setPhase("2fa");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handle2faSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid verification code");
        setLoading(false);
        return;
      }

      await update({
        twoFactorHmac: data.twoFactorHmac,
        twoFactorTimestamp: data.twoFactorTimestamp,
      });

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-burgundy text-white font-serif text-2xl font-bold mb-4">
            CM
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">
            Campaign Manager
          </h1>
          <p className="text-sm text-muted mt-1">Content Management System</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-card border border-line p-8">
          {phase === "credentials" ? (
            <>
              <h2 className="text-lg font-semibold text-ink mb-6">
                Sign in to your account
              </h2>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleCredentialsSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    placeholder="admin@campaigns.local"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-burgundy text-white rounded-lg font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-ink mb-2">
                Two-Factor Authentication
              </h2>
              <p className="text-sm text-muted mb-6">
                Enter the 6-digit code from your authenticator app.
              </p>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handle2faSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="totp"
                    className="block text-sm font-medium text-ink mb-1.5"
                  >
                    Authentication Code
                  </label>
                  <input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-burgundy text-white rounded-lg font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Authorized personnel only. All actions are logged.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex items-center justify-center">
          <div className="text-muted">Loading...</div>
        </div>
      }
    >
      <SessionProvider>
        <LoginForm />
      </SessionProvider>
    </Suspense>
  );
}
