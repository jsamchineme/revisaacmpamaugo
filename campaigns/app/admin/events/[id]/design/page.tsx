"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Event {
  id: string;
  title: string;
  slug: string;
  designContent: string | null;
}

const HELP_TEXT = `Paste your complete HTML page here.

Tips:
- Use Tailwind CSS classes for styling (bg-cream, text-ink, font-serif, etc.)
- Include {{rsvpForm}} where the RSVP form should appear, or leave it out and the form will render below your content
- Available placeholders: {{eventTitle}}, {{eventDate}}, {{eventTime}}, {{venue}}
- Keep it responsive — the container is max-w-5xl mx-auto
- Do not include <html>, <head>, or <body> tags — just the page content`;

export default function EventDesignPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  async function fetchEvent() {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();
      setEvent(data);
      if (data.designContent) {
        setHtmlContent(data.designContent);
      }
    } catch (err) {
      setToast({ message: "Failed to load event", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/design`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designContent: htmlContent }),
      });

      if (response.ok) {
        setToast({ message: "Page saved successfully", type: "success" });
      } else {
        const data = await response.json().catch(() => ({}));
        setToast({ message: data.error || "Failed to save page", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Failed to save page", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    if (confirm("Clear all content? This cannot be undone.")) {
      setHtmlContent("");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Design Event Page</h1>
          <p className="text-muted text-sm">
            {event ? event.title : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${eventId}/form-builder`}
            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors text-sm"
          >
            Form Builder
          </Link>
          <button
            onClick={() => router.push("/admin/events")}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowPreview(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !showPreview
              ? "bg-burgundy text-white"
              : "border border-line hover:bg-cream"
          }`}
        >
          Edit HTML
        </button>
        <button
          onClick={() => setShowPreview(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPreview
              ? "bg-burgundy text-white"
              : "border border-line hover:bg-cream"
          }`}
        >
          Preview
        </button>
        <div className="flex-1" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50 text-sm"
        >
          {saving ? "Saving..." : "Save Page"}
        </button>
        {htmlContent && (
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-line rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Edit Mode */}
      {!showPreview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-line overflow-hidden">
              <div className="px-4 py-2 bg-cream border-b border-line flex items-center justify-between">
                <span className="text-sm font-medium text-ink">HTML Editor</span>
                <span className="text-xs text-muted">{htmlContent.length} characters</span>
              </div>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Paste your HTML here..."
                className="w-full h-[600px] p-4 font-mono text-sm resize-none focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-cream rounded-lg border border-line p-4">
              <h3 className="font-medium text-ink mb-2">How to use</h3>
              <pre className="text-xs text-muted whitespace-pre-wrap leading-relaxed">
                {HELP_TEXT}
              </pre>
            </div>

            <div className="bg-white rounded-lg border border-line p-4">
              <h3 className="font-medium text-ink mb-2">Design Tokens</h3>
              <div className="space-y-2 text-xs text-muted">
                <p><code className="bg-cream px-1 rounded">bg-cream</code> — Warm background</p>
                <p><code className="bg-cream px-1 rounded">bg-paper</code> — Page background</p>
                <p><code className="bg-cream px-1 rounded">text-ink</code> — Primary text</p>
                <p><code className="bg-cream px-1 rounded">text-muted</code> — Secondary text</p>
                <p><code className="bg-cream px-1 rounded">text-burgundy</code> — Accent color</p>
                <p><code className="bg-cream px-1 rounded">text-gold</code> — Gold accent</p>
                <p><code className="bg-cream px-1 rounded">font-serif</code> — Elegant headings</p>
                <p><code className="bg-cream px-1 rounded">border-line</code> — Subtle borders</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-line p-4">
              <h3 className="font-medium text-ink mb-2">Placeholders</h3>
              <div className="space-y-1 text-xs text-muted">
                <p><code className="bg-cream px-1 rounded">{"{{eventTitle}}"}</code></p>
                <p><code className="bg-cream px-1 rounded">{"{{eventDate}}"}</code></p>
                <p><code className="bg-cream px-1 rounded">{"{{eventTime}}"}</code></p>
                <p><code className="bg-cream px-1 rounded">{"{{venue}}"}</code></p>
                <p><code className="bg-cream px-1 rounded">{"{{rsvpForm}}"}</code> — Inserts RSVP form</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Mode */}
      {showPreview && (
        <div className="bg-white rounded-lg border border-line overflow-hidden">
          <div className="px-4 py-2 bg-cream border-b border-line">
            <span className="text-sm font-medium text-ink">Preview</span>
          </div>
          {htmlContent ? (
            <div className="p-4">
              <div
                className="border border-dashed border-line rounded-lg p-4 min-h-[300px]"
                dangerouslySetInnerHTML={{
                  __html: htmlContent
                    .replace(/\{\{eventTitle\}\}/g, event?.title || "Event Title")
                    .replace(/\{\{eventDate\}\}/g, "Saturday, 11 July 2026")
                    .replace(/\{\{eventTime\}\}/g, "1:00 PM")
                    .replace(/\{\{venue\}\}/g, "Landmark Event Center, Owerri")
                    .replace(/\{\{rsvpForm\}\}/g, '<div class="bg-cream border border-line rounded-lg p-6 text-center text-muted">RSVP Form will appear here on the public page</div>'),
                }}
              />
            </div>
          ) : (
            <div className="p-12 text-center text-muted">
              <p className="text-lg mb-2">No content yet</p>
              <p className="text-sm">Switch to Edit mode and paste your HTML to see a preview.</p>
            </div>
          )}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
