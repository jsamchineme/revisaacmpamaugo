"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Event {
  id: string;
  title: string;
  slug: string;
  designContent: string | null;
}

export default function EventDesignPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevBlobRef = useRef<string>("");

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  // Rebuild blob URL whenever htmlContent changes and preview is open
  useEffect(() => {
    if (!showPreview || !htmlContent) return;
    rebuildPreview(htmlContent);
  }, [showPreview, htmlContent]);

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    };
  }, []);

  function rebuildPreview(html: string) {
    if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    prevBlobRef.current = url;
    setPreviewSrc(url);
  }

  async function fetchEvent() {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();
      setEvent(data);
      if (data.designContent) {
        setHtmlContent(data.designContent);
        setFileName("(saved design)");
      }
    } catch {
      setToast({ message: "Failed to load event", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      setToast({ message: "Please upload an HTML file (.html or .htm)", type: "error" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setHtmlContent(content);
      setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      setShowPreview(false); // reset to edit mode so user sees the file info
    };
    reader.readAsText(file);
  }

  async function handleSave() {
    if (!htmlContent) {
      setToast({ message: "No HTML file loaded", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/events/${eventId}/design`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designContent: htmlContent }),
      });

      if (response.ok) {
        setToast({ message: "Design saved successfully", type: "success" });
      } else {
        const data = await response.json().catch(() => ({}));
        setToast({ message: data.error || "Failed to save design", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to save design", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    if (confirm("Remove the uploaded design? This cannot be undone.")) {
      setHtmlContent("");
      setFileName("");
      setShowPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          <p className="text-muted text-sm">{event ? event.title : "Loading..."}</p>
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
        {htmlContent && (
          <>
            <button
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !showPreview ? "bg-burgundy text-white" : "border border-line hover:bg-cream"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showPreview ? "bg-burgundy text-white" : "border border-line hover:bg-cream"
              }`}
            >
              Preview
            </button>
          </>
        )}
        <div className="flex-1" />
        {htmlContent && (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? "Saving..." : "Save Design"}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-line rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors text-sm"
            >
              Remove
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: upload area or preview */}
        <div className="lg:col-span-2">
          {!showPreview ? (
            <div className="space-y-4">
              {/* Upload zone */}
              <div
                className="border-2 border-dashed border-line rounded-xl bg-cream/40 flex flex-col items-center justify-center p-12 cursor-pointer hover:border-gold hover:bg-cream/70 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file && fileInputRef.current) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInputRef.current.files = dt.files;
                    fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-4xl mb-4">📄</div>
                {htmlContent ? (
                  <>
                    <p className="text-sm font-medium text-ink mb-1">File loaded</p>
                    <p className="text-xs text-muted text-center">{fileName}</p>
                    <p className="text-xs text-gold mt-3 font-medium">Click to replace</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink mb-1">Upload your HTML design file</p>
                    <p className="text-xs text-muted text-center">
                      Drag and drop or click to browse — accepts .html files
                    </p>
                    <p className="text-xs text-muted text-center mt-2">
                      Include <code className="bg-white px-1 rounded border border-line">{"{{rsvpForm}}"}</code> where the registration form should appear
                    </p>
                  </>
                )}
              </div>

              {htmlContent && (
                <div className="bg-white border border-line rounded-lg p-4 flex items-center gap-3">
                  <div className="text-2xl">✅</div>
                  <div>
                    <p className="text-sm font-medium text-ink">{fileName}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {(htmlContent.length / 1024).toFixed(1)} KB • Click Preview to inspect, then Save Design to publish
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Preview via iframe so scripts execute and the design renders correctly */
            <div className="bg-white rounded-lg border border-line overflow-hidden">
              <div className="px-4 py-2 bg-cream border-b border-line flex items-center justify-between">
                <span className="text-sm font-medium text-ink">Preview</span>
                <span className="text-xs text-muted">
                  {"{{rsvpForm}}"} placeholder shown as a stand-in — the real form renders on the live page
                </span>
              </div>
              {previewSrc ? (
                <iframe
                  src={previewSrc}
                  className="w-full border-0 block"
                  style={{ height: 680 }}
                  title="Design preview"
                />
              ) : (
                <div className="p-12 text-center text-muted text-sm">
                  Building preview…
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: help panel */}
        <div className="space-y-4">
          <div className="bg-cream rounded-lg border border-line p-4">
            <h3 className="font-medium text-ink mb-2">How it works</h3>
            <ul className="text-xs text-muted space-y-2 leading-relaxed">
              <li>1. Use AI to generate a full HTML event page design</li>
              <li>2. Add <code className="bg-white px-1 rounded border border-line">{"{{rsvpForm}}"}</code> where the registration form should appear</li>
              <li>3. Upload the .html file here and click Save Design</li>
              <li>4. The RSVP form from the Form Builder is injected automatically on the live page</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg border border-line p-4">
            <h3 className="font-medium text-ink mb-2">Placeholders</h3>
            <div className="space-y-1 text-xs text-muted">
              <p><code className="bg-cream px-1 rounded">{"{{eventTitle}}"}</code> — Event name</p>
              <p><code className="bg-cream px-1 rounded">{"{{eventDate}}"}</code> — Formatted date</p>
              <p><code className="bg-cream px-1 rounded">{"{{eventTime}}"}</code> — Formatted time</p>
              <p><code className="bg-cream px-1 rounded">{"{{venue}}"}</code> — Venue name</p>
              <p><code className="bg-cream px-1 rounded">{"{{rsvpForm}}"}</code> — RSVP form (required)</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-line p-4">
            <h3 className="font-medium text-ink mb-2">Tips</h3>
            <ul className="text-xs text-muted space-y-1 leading-relaxed">
              <li>• The design renders in a full-page iframe on the public event page — scripts and embedded styles work</li>
              <li>• If no <code className="bg-cream px-1 rounded">{"{{rsvpForm}}"}</code> is found, the form is appended at the bottom of the page</li>
              <li>• Bundled HTML files (AI-generated all-in-one pages) work as-is</li>
            </ul>
          </div>

          {event && (
            <a
              href={`/events/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm text-ink"
            >
              View Live Page ↗
            </a>
          )}
        </div>
      </div>

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
