"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Settings {
  siteTitle: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  facebook: string;
  youtube: string;
  instagram: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();

  const [settings, setSettings] = useState<Settings>({
    siteTitle: "The Ministry of Rev. Isaac Mpamaugo",
    tagline: "A lifetime of faithful service, sermons, and teaching",
    email: "hello@isaacmpamaugo.org",
    phone: "+234 (0)800 000 0000",
    location: "Lagos, Nigeria",
    facebook: "",
    youtube: "",
    instagram: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // 2FA state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState("");
  const [show2faSetup, setShow2faSetup] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableMessage, setDisableMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchUser();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("Password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setPasswordMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setPasswordMessage(data.error || "Failed to change password.");
      }
    } catch (error) {
      setPasswordMessage("An error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleEnable2fa() {
    setTwoFactorMessage("");
    setTwoFactorLoading(true);

    try {
      const res = await fetch("/api/user/2fa/setup");
      if (res.ok) {
        const data = await res.json();
        setTwoFactorSecret(data.secret);
        setQrCodeDataUrl(data.qrCodeDataUrl);
        setShow2faSetup(true);
      } else {
        setTwoFactorMessage("Failed to start 2FA setup.");
      }
    } catch (error) {
      setTwoFactorMessage("An error occurred.");
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function handleVerify2fa(e: React.FormEvent) {
    e.preventDefault();
    setTwoFactorMessage("");
    setTwoFactorLoading(true);

    try {
      const res = await fetch("/api/user/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: twoFactorSecret, token: twoFactorCode }),
      });

      if (res.ok) {
        setTwoFactorMessage("Two-factor authentication enabled successfully!");
        setShow2faSetup(false);
        setTwoFactorSecret("");
        setQrCodeDataUrl("");
        setTwoFactorCode("");
        // Refresh user profile
        const userRes = await fetch("/api/user/me");
        if (userRes.ok) {
          const data = await userRes.json();
          setUserProfile(data);
        }
      } else {
        const data = await res.json();
        setTwoFactorMessage(data.error || "Failed to verify code.");
      }
    } catch (error) {
      setTwoFactorMessage("An error occurred.");
    } finally {
      setTwoFactorLoading(false);
    }
  }

  async function handleDisable2fa(e: React.FormEvent) {
    e.preventDefault();
    setDisableMessage("");
    setDisableLoading(true);

    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });

      if (res.ok) {
        setDisableMessage("Two-factor authentication disabled successfully!");
        setShowDisableForm(false);
        setDisablePassword("");
        // Refresh user profile
        const userRes = await fetch("/api/user/me");
        if (userRes.ok) {
          const data = await userRes.json();
          setUserProfile(data);
        }
      } else {
        const data = await res.json();
        setDisableMessage(data.error || "Failed to disable 2FA.");
      }
    } catch (error) {
      setDisableMessage("An error occurred.");
    } finally {
      setDisableLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.includes("success")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Site Settings */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-line p-6 space-y-6"
      >
        {/* Site Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Site Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Site Title
              </label>
              <input
                type="text"
                value={settings.siteTitle}
                onChange={(e) =>
                  setSettings({ ...settings, siteTitle: e.target.value })
                }
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) =>
                  setSettings({ ...settings, tagline: e.target.value })
                }
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink mb-1">
                Location
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) =>
                  setSettings({ ...settings, location: e.target.value })
                }
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                value={settings.facebook}
                onChange={(e) =>
                  setSettings({ ...settings, facebook: e.target.value })
                }
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                YouTube URL
              </label>
              <input
                type="url"
                value={settings.youtube}
                onChange={(e) =>
                  setSettings({ ...settings, youtube: e.target.value })
                }
                placeholder="https://youtube.com/..."
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagram}
                onChange={(e) =>
                  setSettings({ ...settings, instagram: e.target.value })
                }
                placeholder="https://instagram.com/..."
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-line">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Password Change */}
      <div className="bg-white rounded-lg border border-line p-6 space-y-6">
        <h2 className="text-lg font-semibold">Change Password</h2>

        {passwordMessage && (
          <div
            className={`px-4 py-3 rounded-lg ${
              passwordMessage.includes("success")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {passwordMessage}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg border border-line p-6 space-y-6">
        <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>

        {twoFactorMessage && (
          <div
            className={`px-4 py-3 rounded-lg ${
              twoFactorMessage.includes("success")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {twoFactorMessage}
          </div>
        )}

        {userProfile?.twoFactorEnabled ? (
          <div className="space-y-4">
            <p className="text-sm text-green-700">
              Two-factor authentication is enabled on your account.
            </p>

            {!showDisableForm ? (
              <button
                onClick={() => setShowDisableForm(true)}
                className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <form onSubmit={handleDisable2fa} className="space-y-4">
                {disableMessage && (
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      disableMessage.includes("success")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {disableMessage}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Confirm your password
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={disableLoading}
                    className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
                  >
                    {disableLoading ? "Disabling..." : "Confirm Disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisableForm(false);
                      setDisablePassword("");
                      setDisableMessage("");
                    }}
                    className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Add an extra layer of security to your account by enabling
              two-factor authentication.
            </p>

            {!show2faSetup ? (
              <button
                onClick={handleEnable2fa}
                disabled={twoFactorLoading}
                className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
              >
                {twoFactorLoading ? "Loading..." : "Enable 2FA"}
              </button>
            ) : (
              <form onSubmit={handleVerify2fa} className="space-y-4">
                {qrCodeDataUrl && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code for 2FA setup"
                      className="w-48 h-48"
                    />
                    <p className="text-xs text-muted text-center">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                )}

                {twoFactorSecret && (
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Secret Key (manual entry)
                    </label>
                    <input
                      type="text"
                      value={twoFactorSecret}
                      readOnly
                      className="w-full px-4 py-2 border border-line rounded-lg bg-paper text-ink text-sm font-mono"
                      onClick={(e) => e.currentTarget.select()}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    required
                    placeholder="000000"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={twoFactorLoading}
                    className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
                  >
                    {twoFactorLoading ? "Verifying..." : "Verify and Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2faSetup(false);
                      setTwoFactorSecret("");
                      setQrCodeDataUrl("");
                      setTwoFactorCode("");
                      setTwoFactorMessage("");
                    }}
                    className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
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
