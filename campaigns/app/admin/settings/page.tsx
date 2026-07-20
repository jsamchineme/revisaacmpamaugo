"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();

  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEventId, setFeaturedEventId] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeDataUrl: string;
  } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [settingsRes, eventsRes, userRes] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/events"),
          fetch("/api/user/me"),
        ]);
        const settings = await settingsRes.json();
        const eventsData = await eventsRes.json();
        const userData = await userRes.json();

        setFeaturedEventId(settings.featuredEventId ?? "");
        setFallbackUrl(settings.fallbackUrl ?? "");
        setEvents(
          Array.isArray(eventsData) ? eventsData : eventsData.events ?? []
        );
        setTwoFactorEnabled(userData.twoFactorEnabled ?? false);
      } catch {
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredEventId, fallbackUrl }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password.");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleEnable2fa() {
    setTwoFactorError(null);
    setTwoFactorSuccess(null);
    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/user/2fa/setup");
      if (!res.ok) throw new Error("Failed to generate 2FA setup.");
      const data = await res.json();
      setSetupData(data);
    } catch (err) {
      setTwoFactorError(
        err instanceof Error ? err.message : "Failed to start 2FA setup."
      );
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function handleVerifyAndEnable2fa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFactorError(null);
    setTwoFactorSuccess(null);
    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: setupData?.secret,
          token: verifyCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to verify code.");
      }

      setTwoFactorSuccess("Two-factor authentication enabled successfully.");
      setSetupData(null);
      setVerifyCode("");
      setTwoFactorEnabled(true);
      setTimeout(() => setTwoFactorSuccess(null), 3000);
    } catch (err) {
      setTwoFactorError(
        err instanceof Error ? err.message : "Failed to verify code."
      );
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function handleDisable2fa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFactorError(null);
    setTwoFactorSuccess(null);
    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disable 2FA.");
      }

      setTwoFactorSuccess("Two-factor authentication disabled successfully.");
      setDisablePassword("");
      setShowDisableForm(false);
      setTwoFactorEnabled(false);
      setTimeout(() => setTwoFactorSuccess(null), 3000);
    } catch (err) {
      setTwoFactorError(
        err instanceof Error ? err.message : "Failed to disable 2FA."
      );
    } finally {
      setTwoFactorLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading settings...</div>
      </div>
    );
  }

  const featuredEvent = events.find((e) => e.id === featuredEventId);

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">Settings</h1>
        <p className="text-muted mt-1">Configure app-wide behaviour.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-line divide-y divide-line">
        {/* Featured Event */}
        <div className="p-6 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Featured Event
            </label>
            <p className="text-xs text-muted mb-3">
              Visitors to the root URL ({" "}
              <code className="bg-cream px-1 rounded">/</code>) will be shown
              this event&apos;s page. Leave unset to redirect to the fallback URL
              instead.
            </p>
            <select
              value={featuredEventId}
              onChange={(e) => setFeaturedEventId(e.target.value)}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/30"
            >
              <option value="">
                — No featured event (use fallback URL) —
              </option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
            {featuredEvent && (
              <p className="mt-2 text-xs text-muted">
                Root URL will show:{" "}
                <a
                  href={`/events/${featuredEvent.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-burgundy underline"
                >
                  /events/{featuredEvent.slug}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Fallback URL */}
        <div className="p-6 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1">
              Fallback Redirect URL
            </label>
            <p className="text-xs text-muted mb-3">
              When no featured event is set, the root URL redirects here. Can be
              an external URL or an internal path.
            </p>
            <input
              type="url"
              value={fallbackUrl}
              onChange={(e) => setFallbackUrl(e.target.value)}
              placeholder="https://example.com or /events/my-event"
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && (
          <span className="text-sm text-green-700 font-medium">
            Settings saved.
          </span>
        )}
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-xl border border-line p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">
          Change Password
        </h2>

        {passwordError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            Password changed successfully.
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-ink mb-1"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30"
            />
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-ink mb-1"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-ink mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60"
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication Section */}
      <div className="bg-white rounded-xl border border-line p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">
          Two-Factor Authentication
        </h2>

        {twoFactorError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {twoFactorError}
          </div>
        )}
        {twoFactorSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            {twoFactorSuccess}
          </div>
        )}

        {!twoFactorEnabled ? (
          <div className="space-y-4">
            {!setupData ? (
              <div>
                <p className="text-sm text-muted mb-3">
                  Add an extra layer of security to your account by enabling
                  two-factor authentication.
                </p>
                <button
                  onClick={handleEnable2fa}
                  disabled={twoFactorLoading}
                  className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60"
                >
                  {twoFactorLoading ? "Loading..." : "Enable 2FA"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  Scan the QR code with your authenticator app, then enter the
                  6-digit verification code below.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={setupData.qrCodeDataUrl}
                    alt="QR Code for 2FA setup"
                    className="w-48 h-48"
                  />
                  <div className="text-center">
                    <p className="text-xs text-muted mb-1">
                      Can&apos;t scan? Enter this secret manually:
                    </p>
                    <code className="bg-cream px-2 py-1 rounded text-sm break-all">
                      {setupData.secret}
                    </code>
                  </div>
                </div>
                <form
                  onSubmit={handleVerifyAndEnable2fa}
                  className="space-y-3"
                >
                  <div>
                    <label
                      htmlFor="verifyCode"
                      className="block text-sm font-medium text-ink mb-1"
                    >
                      Verification Code
                    </label>
                    <input
                      id="verifyCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      required
                      autoComplete="one-time-code"
                      className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30"
                      placeholder="000000"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={twoFactorLoading}
                      className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60"
                    >
                      {twoFactorLoading ? "Verifying..." : "Verify and Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSetupData(null);
                        setVerifyCode("");
                      }}
                      className="px-5 py-2.5 text-sm font-medium text-muted hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-green-700 font-medium">
              Two-factor authentication is enabled.
            </p>

            {!showDisableForm ? (
              <button
                onClick={() => setShowDisableForm(true)}
                className="px-5 py-2.5 text-sm font-medium text-burgundy border border-burgundy rounded-lg hover:bg-burgundy/5 transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <form onSubmit={handleDisable2fa} className="space-y-3">
                <p className="text-sm text-muted">
                  Enter your password to disable two-factor authentication.
                </p>
                <div>
                  <label
                    htmlFor="disablePassword"
                    className="block text-sm font-medium text-ink mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="disablePassword"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/30"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={twoFactorLoading}
                    className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors disabled:opacity-60"
                  >
                    {twoFactorLoading ? "Disabling..." : "Confirm Disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableForm(false);
                      setDisablePassword("");
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
