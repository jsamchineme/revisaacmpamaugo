"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Verify2faPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;

    const twoFactorRequired = session.user?.twoFactorRequired ?? false;
    const twoFactorVerified = session.user?.twoFactorVerified ?? false;

    if (!twoFactorRequired) {
      router.push("/admin");
    } else if (twoFactorVerified) {
      router.push("/admin");
    }
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
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

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-burgundy text-white font-serif text-2xl font-bold mb-4">
            CM
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink">
            Campaign Manager
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-line p-8">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-ink mb-1.5"
              >
                Authentication Code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
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
        </div>
      </div>
    </div>
  );
}
