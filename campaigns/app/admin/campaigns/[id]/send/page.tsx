"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Campaign {
  id: string;
  title: string;
  whatsappTemplateSid: string | null;
  emailBody: string | null;
  link: string;
}

interface CampaignContact {
  id: string;
  status: string;
}

interface SendResult {
  sent: number;
  failed: number;
  skipped: number;
  results?: { campaignContactId: string; contactName: string; status: string; error?: string }[];
}

interface TestResult {
  results: { channel: string; status: string; error?: string }[];
}

export default function CampaignSendPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contactCount, setContactCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Channel toggles
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  // Send state
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState("");
  const [sendResults, setSendResults] = useState<{
    whatsapp?: SendResult;
    email?: SendResult;
  } | null>(null);

  // Test state
  const [testPhone, setTestPhone] = useState("");
  const [showTestInput, setShowTestInput] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchContacts();
    }
  }, [id]);

  async function fetchCampaign() {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`);
      if (!response.ok) throw new Error("Failed to load campaign");
      const data: Campaign = await response.json();
      setCampaign(data);
      setSendWhatsapp(!!data.whatsappTemplateSid);
      setSendEmail(!!data.emailBody);
    } catch (err) {
      setError("Failed to load campaign data.");
    }
  }

  async function fetchContacts() {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}/contacts`);
      if (!response.ok) throw new Error("Failed to load contacts");
      const data: CampaignContact[] = await response.json();
      setContactCount(data.length);
      setSentCount(data.filter((cc) => cc.status === "sent" || cc.status === "failed").length);
    } catch (err) {
      // Non-critical — just can't show counts
    } finally {
      setLoading(false);
    }
  }

  async function handleSendTest() {
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);

    try {
      const body: { phone?: string; email?: string } = {};
      if (testPhone.trim()) {
        body.phone = testPhone.trim();
      }
      // Use the admin's email from the session — fetch from a profile endpoint
      // For now, pass a flag so the server uses session email
      const response = await fetch(
        `/api/admin/campaigns/${id}/send-test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send test");
      }

      const data: TestResult = await response.json();
      setTestResult(data);
    } catch (err: any) {
      setTestError(err.message || "Failed to send test message");
    } finally {
      setTestLoading(false);
    }
  }

  async function handleSendToAll() {
    setShowModal(false);
    setSending(true);
    setError(null);
    setSendResults(null);

    const results: { whatsapp?: SendResult; email?: SendResult } = {};

    try {
      if (sendWhatsapp) {
        setSendProgress("Sending WhatsApp messages...");
        const waRes = await fetch(`/api/admin/campaigns/${id}/send-whatsapp`, {
          method: "POST",
        });
        if (waRes.ok) {
          results.whatsapp = await waRes.json();
        } else {
          const err = await waRes.json();
          setError(err.error || "WhatsApp send failed");
        }
      }

      if (sendEmail) {
        setSendProgress("Sending Email messages...");
        const emRes = await fetch(`/api/admin/campaigns/${id}/send-email`, {
          method: "POST",
        });
        if (emRes.ok) {
          results.email = await emRes.json();
        } else {
          const err = await emRes.json();
          setError((prev) => (prev ? prev + "; " : "") + (err.error || "Email send failed"));
        }
      }

      setSendResults(results);
      setSendProgress("");

      // Show success toast
      const totalSent = (results.whatsapp?.sent || 0) + (results.email?.sent || 0);
      if (totalSent > 0) {
        setToast({ message: `Campaign sent to ${totalSent} contact${totalSent > 1 ? "s" : ""}`, type: "success" });
      }

      // Refresh contact statuses
      fetchContacts();
    } catch (err: any) {
      setError(err.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  }

  function getTotalSent(): number {
    let total = 0;
    if (sendResults?.whatsapp) total += sendResults.whatsapp.sent;
    if (sendResults?.email) total += sendResults.email.sent;
    return total;
  }

  function getTotalFailed(): number {
    let total = 0;
    if (sendResults?.whatsapp) total += sendResults.whatsapp.failed;
    if (sendResults?.email) total += sendResults.email.failed;
    return total;
  }

  function getTotalSkipped(): number {
    let total = 0;
    if (sendResults?.whatsapp) total += sendResults.whatsapp.skipped;
    if (sendResults?.email) total += sendResults.email.skipped;
    return total;
  }

  const alreadySent = sentCount > 0;
  const noContacts = contactCount === 0;
  const noChannelSelected = !sendWhatsapp && !sendEmail;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Campaign not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <p className="text-muted text-sm">Send campaign to assigned contacts</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/campaigns/${id}/logs`}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            View Logs
          </Link>
          <button
            onClick={() => router.push("/admin/campaigns")}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-sm underline flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* Campaign summary */}
      <div className="bg-white rounded-lg border border-line p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Contacts:</span>
            <span className="inline-flex px-3 py-1 rounded-full bg-cream text-ink font-medium text-sm">
              {contactCount} assigned
            </span>
          </div>
          {sentCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Already sent:</span>
              <span className="inline-flex px-3 py-1 rounded-full bg-gold/10 text-gold font-medium text-sm">
                {sentCount} contact{sentCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* WhatsApp info */}
        {campaign.whatsappTemplateSid && (
          <div className="text-sm text-muted">
            WhatsApp Template:{" "}
            <code className="px-1.5 py-0.5 bg-cream rounded text-xs font-mono">
              {campaign.whatsappTemplateSid}
            </code>
          </div>
        )}

        {/* Email body preview */}
        {campaign.emailBody && (
          <details className="text-sm">
            <summary className="cursor-pointer text-muted hover:text-ink">
              Email body preview
            </summary>
            <pre className="mt-2 p-3 bg-cream rounded-lg text-xs whitespace-pre-wrap font-mono">
              {campaign.emailBody}
            </pre>
          </details>
        )}
      </div>

      {/* Channel Toggles */}
      <div className="bg-white rounded-lg border border-line p-6 space-y-4">
        <h2 className="text-lg font-medium">Channels</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp Toggle */}
          <label
            className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              !campaign.whatsappTemplateSid
                ? "border-line bg-cream/50 cursor-not-allowed opacity-60"
                : sendWhatsapp
                ? "border-green-500 bg-green-50 cursor-pointer"
                : "border-line hover:border-gold/50 cursor-pointer"
            }`}
            title={
              !campaign.whatsappTemplateSid
                ? "No WhatsApp template SID configured for this campaign"
                : ""
            }
          >
            <input
              type="checkbox"
              checked={sendWhatsapp}
              onChange={() => {
                if (campaign.whatsappTemplateSid) setSendWhatsapp(!sendWhatsapp);
              }}
              disabled={!campaign.whatsappTemplateSid || sending || alreadySent}
              className="w-5 h-5 accent-green-600"
            />
            <div>
              <div className="font-medium">WhatsApp</div>
              <div className="text-xs text-muted">
                {campaign.whatsappTemplateSid
                  ? "Send via Twilio WhatsApp template"
                  : "Requires WhatsApp template SID"}
              </div>
            </div>
            {!campaign.whatsappTemplateSid && (
              <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                Unavailable
              </span>
            )}
          </label>

          {/* Email Toggle */}
          <label
            className={`relative flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
              !campaign.emailBody
                ? "border-line bg-cream/50 cursor-not-allowed opacity-60"
                : sendEmail
                ? "border-green-500 bg-green-50 cursor-pointer"
                : "border-line hover:border-gold/50 cursor-pointer"
            }`}
            title={
              !campaign.emailBody ? "No email body configured for this campaign" : ""
            }
          >
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={() => {
                if (campaign.emailBody) setSendEmail(!sendEmail);
              }}
              disabled={!campaign.emailBody || sending || alreadySent}
              className="w-5 h-5 accent-green-600"
            />
            <div>
              <div className="font-medium">Email</div>
              <div className="text-xs text-muted">
                {campaign.emailBody
                  ? "Send via SMTP with per-recipient tracking"
                  : "Requires email body"}
              </div>
            </div>
            {!campaign.emailBody && (
              <span className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                Unavailable
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Re-send Guard */}
      {alreadySent && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">&#9888;</div>
          <h3 className="text-lg font-bold text-yellow-800 mb-1">
            Already Sent
          </h3>
          <p className="text-yellow-700">
            This campaign has already been sent to {sentCount} contact
            {sentCount > 1 ? "s" : ""}. Sending again will create duplicate
            messages.{" "}
            <Link
              href={`/admin/campaigns/${id}/logs`}
              className="underline font-medium"
            >
              View send logs
            </Link>
          </p>
        </div>
      )}

      {/* Test to Self */}
      <div className="bg-white rounded-lg border border-line p-6 space-y-4">
        <h2 className="text-lg font-medium">Send Test to Self</h2>
        <p className="text-sm text-muted">
          Send a test message to verify your campaign before sending to all
          contacts.
        </p>

        {!showTestInput ? (
          <button
            onClick={() => setShowTestInput(true)}
            disabled={sending}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Send Test Message
          </button>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Number (E.164 format)</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+2348012345678"
                disabled={!campaign.whatsappTemplateSid}
                className={`w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
                  !campaign.whatsappTemplateSid ? "opacity-50" : ""
                }`}
              />
              {!campaign.whatsappTemplateSid && (
                <p className="text-xs text-muted">
                  WhatsApp test unavailable — no template SID configured
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSendTest}
                disabled={testLoading || (!testPhone.trim() && !campaign.emailBody)}
                className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50 text-sm"
              >
                {testLoading ? "Sending..." : "Send Test"}
              </button>
              <button
                onClick={() => {
                  setShowTestInput(false);
                  setTestPhone("");
                  setTestResult(null);
                  setTestError(null);
                }}
                disabled={testLoading}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
              >
                Cancel
              </button>
            </div>

            {testError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {testError}
              </div>
            )}

            {testResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
                <p className="text-green-800 font-medium text-sm">Test Results:</p>
                {testResult.results.map((r, i) => (
                  <div key={i} className="text-sm flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        r.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : r.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-muted capitalize">{r.channel}</span>
                    {r.error && (
                      <span className="text-red-600 text-xs">— {r.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Progress / Results */}
      {(sending || sendResults) && (
        <div className="bg-white rounded-lg border border-line p-6 space-y-4">
          <h2 className="text-lg font-medium">Send Status</h2>

          {sending && (
            <div className="flex items-center gap-3 text-sm text-muted">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              {sendProgress}
            </div>
          )}

          {sendResults && (
            <div className="space-y-4">
              {/* WhatsApp results */}
              {sendResults.whatsapp && (
                <div className="p-4 bg-cream rounded-lg space-y-2">
                  <h3 className="font-medium text-sm">WhatsApp</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-700">
                      {sendResults.whatsapp.sent} sent
                    </span>
                    <span className="text-red-600">
                      {sendResults.whatsapp.failed} failed
                    </span>
                    <span className="text-yellow-600">
                      {sendResults.whatsapp.skipped} skipped
                    </span>
                  </div>
                  {sendResults.whatsapp.results && sendResults.whatsapp.results.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted hover:text-ink">
                        View details
                      </summary>
                      <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                        {sendResults.whatsapp.results.map((r: any, i: number) => (
                          <div
                            key={i}
                            className={`px-2 py-1 rounded ${
                              r.status === "sent"
                                ? "bg-green-50"
                                : r.status === "failed"
                                ? "bg-red-50"
                                : "bg-yellow-50"
                            }`}
                          >
                            <span className="font-medium">{r.contactName}</span>
                            : {r.status}
                            {r.error && (
                              <span className="text-red-600 ml-2">— {r.error}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Email results */}
              {sendResults.email && (
                <div className="p-4 bg-cream rounded-lg space-y-2">
                  <h3 className="font-medium text-sm">Email</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-700">
                      {sendResults.email.sent} sent
                    </span>
                    <span className="text-red-600">
                      {sendResults.email.failed} failed
                    </span>
                    <span className="text-yellow-600">
                      {sendResults.email.skipped} skipped
                    </span>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="flex items-center justify-between pt-2 border-t border-line">
                <div className="flex gap-4 text-sm font-medium">
                  <span className="text-green-700">{getTotalSent()} sent</span>
                  <span className="text-red-600">{getTotalFailed()} failed</span>
                  <span className="text-yellow-600">{getTotalSkipped()} skipped</span>
                </div>
                <Link
                  href={`/admin/campaigns/${id}/logs`}
                  className="text-sm text-gold hover:text-gold-dark underline"
                >
                  View detailed logs →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send to All Button */}
      {!alreadySent && !noContacts && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowModal(true)}
            disabled={noChannelSelected || sending}
            className="px-8 py-3 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50 text-lg font-medium"
            title={
              noChannelSelected
                ? "Select at least one channel to send"
                : noContacts
                ? "No contacts assigned to this campaign"
                : ""
            }
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              `Send to ${contactCount} Contact${contactCount > 1 ? "s" : ""}`
            )}
          </button>
        </div>
      )}

      {noContacts && !alreadySent && (
        <div className="text-center py-8 text-muted">
          No contacts assigned to this campaign.{" "}
          <Link
            href={`/admin/campaigns/${id}/contacts`}
            className="text-gold underline"
          >
            Assign contacts first
          </Link>
          .
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Send</h2>
            <p className="text-muted mb-2">
              You are about to send this campaign to{" "}
              <strong>{contactCount} contact{contactCount > 1 ? "s" : ""}</strong>.
            </p>
            <div className="mb-4 space-y-1 text-sm">
              {sendWhatsapp && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  WhatsApp: Enabled
                </div>
              )}
              {sendEmail && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Email: Enabled
                </div>
              )}
              {!sendWhatsapp && !sendEmail && (
                <div className="text-red-600">
                  No channels selected. Please enable at least one.
                </div>
              )}
            </div>
            <p className="text-xs text-muted mb-6">
              Messages are sent immediately and cannot be recalled.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToAll}
                disabled={noChannelSelected}
                className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
