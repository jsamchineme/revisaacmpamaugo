"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Event {
  id: string;
  title: string;
  slug: string;
  designContent: string | null;
}

type Tab = "upload" | "preview" | "images";

// ── Selection script ──────────────────────────────────────────────────────────

const SELECTION_SCRIPT = `
(function() {
  if (window.__rsvpSelActive) return;
  window.__rsvpSelActive = true;

  var ov = document.createElement('div');
  ov.setAttribute('data-rsvp-injected', '1');
  ov.style.cssText = [
    'position:fixed;pointer-events:none;box-sizing:border-box;z-index:2147483647',
    'border:2px solid #b08642;background:rgba(176,134,66,0.12)',
    'border-radius:4px;transition:all .08s;display:none'
  ].join(';');
  document.body.appendChild(ov);

  var lbl = document.createElement('div');
  lbl.setAttribute('data-rsvp-injected', '1');
  lbl.style.cssText = [
    'position:fixed;bottom:20px;left:50%;transform:translateX(-50%)',
    'background:#1a1a1a;color:#fff;font:13px/1.5 -apple-system,sans-serif',
    'padding:8px 18px;border-radius:20px;z-index:2147483647',
    'pointer-events:none;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3)'
  ].join(';');
  lbl.textContent = 'Hover over a container and click to set as the RSVP form location';
  document.body.appendChild(lbl);

  document.body.style.cursor = 'crosshair';

  document.addEventListener('mouseover', function(e) {
    var el = e.target;
    if (!el || el.nodeType !== 1) return;
    if (el.getAttribute('data-rsvp-injected')) return;
    var r = el.getBoundingClientRect();
    ov.style.display = 'block';
    ov.style.top = r.top + 'px';
    ov.style.left = r.left + 'px';
    ov.style.width = r.width + 'px';
    ov.style.height = r.height + 'px';
    lbl.textContent = '<' + el.tagName.toLowerCase() + '> — click to set as RSVP location';
  }, true);

  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var el = e.target;
    if (!el || el.nodeType !== 1) return;
    if (el.getAttribute('data-rsvp-injected')) return;

    document.querySelectorAll('[data-rsvp-injected]').forEach(function(n) { n.remove(); });
    document.body.style.cursor = '';
    window.__rsvpSelActive = false;

    el.setAttribute('data-rsvp-target', '1');
    window.parent.postMessage({ type: '__rsvp_sel', html: document.documentElement.outerHTML }, '*');
  }, true);
})();
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

// Detect Claude artifact bundle format and extract usable plain HTML.
// Returns null if the file is not a bundle.
function extractClaudeBundle(raw: string): string | null {
  const parser = new DOMParser();
  const bundleDoc = parser.parseFromString(raw, "text/html");

  const manifestEl = bundleDoc.querySelector('script[type="__bundler/manifest"]');
  const templateEl = bundleDoc.querySelector('script[type="__bundler/template"]');
  if (!manifestEl || !templateEl) return null;

  let manifest: Record<string, { mime: string; data: string }>;
  let tmpl: string;
  try {
    manifest = JSON.parse(manifestEl.textContent!);
    tmpl = JSON.parse(templateEl.textContent!);
  } catch {
    return null;
  }

  // Resolve image resources to data: URIs; remove JS (dc-runtime); skip fonts
  for (const [uuid, res] of Object.entries(manifest)) {
    if (res.mime.includes("javascript")) {
      tmpl = tmpl.replace(new RegExp(`<script\\s+src="${uuid}"></script>`, "g"), "");
      continue;
    }
    if (res.mime.includes("font")) continue; // use Google Fonts instead
    const dataUri = `data:${res.mime};base64,${res.data}`;
    tmpl = tmpl.replace(new RegExp(`src="${uuid}"`, "g"), `src="${dataUri}"`);
  }

  // Strip bundled @font-face declarations (they reference UUID font files)
  tmpl = tmpl.replace(/@font-face\s*\{[^}]+\}/g, "");
  // Remove any stray UUID url() references
  tmpl = tmpl.replace(/url\("[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"\)\s*(format\('[^']*'\))?[,;]?/g, "");

  const gfonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" rel="stylesheet">`;

  // Move <helmet> content into <head>
  const helmetMatch = tmpl.match(/<helmet>([\s\S]*?)<\/helmet>/);
  const helmetInner = helmetMatch
    ? helmetMatch[1].replace(/<link rel="preconnect"[^>]*>\n?/g, "")
    : "";
  if (helmetMatch) tmpl = tmpl.replace(helmetMatch[0], "");

  // Unwrap dc-runtime elements
  tmpl = tmpl.replace(/<\/?x-dc>/g, "").replace(/<\/?helmet>/g, "");
  tmpl = tmpl.replace(/<script type="text\/x-dc"[^>]*>[\s\S]*?<\/script>/g, "");

  // Inject fonts + helmet styles into <head>
  tmpl = tmpl.replace("</head>", `${gfonts}\n${helmetInner}\n</head>`);

  // Convert <sc-for list="{{ countdownParts }}"> → static countdown + JS
  tmpl = tmpl.replace(/<sc-for[^>]*countdownParts[^>]*>([\s\S]*?)<\/sc-for>/g, (_m, inner) => {
    const valStyle = (inner.match(/\{\{ part\.value \}\}/) && inner.match(/<div style="([^"]+)">\{\{ part\.value \}\}/)?.[1]) ?? "";
    const lblStyle = (inner.match(/\{\{ part\.label \}\}/) && inner.match(/<div style="([^"]+)">\{\{ part\.label \}\}/)?.[1]) ?? "";
    const parts = [["days", "Days"], ["hours", "Hours"], ["minutes", "Minutes"], ["seconds", "Seconds"]];
    const html = parts.map(([id, label]) =>
      `<div id="__cd_${id}" style="min-width:80px;"><div style="${valStyle}">00</div><div style="${lblStyle}">${label}</div></div>`
    ).join("");
    const js = `<script>(function(){var t=new Date('2026-12-26T11:00:00+01:00').getTime();function tick(){var d=Math.max(0,t-Date.now());var dy=Math.floor(d/864e5);d-=dy*864e5;var h=Math.floor(d/36e5);d-=h*36e5;var m=Math.floor(d/6e4);d-=m*6e4;var s=Math.floor(d/1e3);[['days',dy],['hours',h],['minutes',m],['seconds',s]].forEach(function(p){var el=document.getElementById('__cd_'+p[0]);if(el)el.firstElementChild.textContent=String(p[1]).padStart(2,'0');});} tick();setInterval(tick,1000);})();</script>`;
    return html + js;
  });

  // Convert <sc-for list="{{ details }}"> → static HTML
  tmpl = tmpl.replace(/<sc-for[^>]*"\{\{ details \}\}"[^>]*>([\s\S]*?)<\/sc-for>/g, (_m, inner) => {
    const cStyle = inner.match(/<div style="([^"]+)">/)?.[1] ?? "";
    const lStyle = inner.match(/<div style="([^"]+)">\{\{ d\.label \}\}/)?.[1] ?? "";
    const vStyle = inner.match(/<p style="([^"]+)">\{\{ d\.value \}\}/)?.[1] ?? "";
    const details = [["THE DATE", "Saturday, December 26, 2026"], ["THE TIME", "Promptly at 11:00 AM"], ["THE PLACE", "Lagos, Nigeria"]];
    return details.map(([l, v]) => `<div style="${cStyle}"><div style="${lStyle}">${l}</div><p style="${vStyle}">${v}</p></div>`).join("");
  });

  // Extract RSVP section styles before replacing it
  const rsvpSectionMatch = tmpl.match(/<!-- RSVP -->([\s\S]*?)<\/section>/);
  if (rsvpSectionMatch) {
    const rsvpDoc = parser.parseFromString(rsvpSectionMatch[0], "text/html");
    const sec      = rsvpDoc.querySelector("section");
    const h2       = rsvpDoc.querySelector("h2");
    const formEl   = rsvpDoc.querySelector("form");
    const fieldDiv = formEl?.querySelector("div");
    const labelEl  = formEl?.querySelector("label");
    const inputEl  = formEl?.querySelector('input[type="text"]');
    const btnEl    = formEl?.querySelector('button[type="submit"]');
    const checkEl  = formEl?.querySelector('input[type="checkbox"]');

    const s  = (el: Element | null | undefined) => el?.getAttribute("style") ?? "";
    const bh = btnEl?.getAttribute("style-hover") ?? "";

    const rsvpCss = `
#__rsvp{${s(sec)}}
#__rsvp h2{${s(h2)}}
#__rsvp_form_wrap{${s(formEl)}}
#__rsvp form>div{${s(fieldDiv)}}
#__rsvp label:not([style]){${s(labelEl)}}
#__rsvp input[type=text],#__rsvp input[type=email],#__rsvp input[type=tel],#__rsvp select,#__rsvp textarea{${s(inputEl)}margin-top:6px;}
#__rsvp input[type=text]:focus,#__rsvp input[type=email]:focus,#__rsvp input[type=tel]:focus,#__rsvp select:focus,#__rsvp textarea:focus{border-color:oklch(0.55 0.1 82);outline:none;}
#__rsvp input[type=checkbox]{${s(checkEl)}}
#__rsvp_btn{${s(btnEl)}}
${bh ? `#__rsvp_btn:hover{${bh}}` : ""}
#__rsvp_btn:disabled{opacity:.65;cursor:not-allowed;}
#__rsvp_error{padding:10px 14px;margin-bottom:16px;background:rgba(192,57,43,.08);border-left:3px solid #c0392b;color:#c0392b;text-align:left;}
#__rsvp_success{padding:48px 24px;text-align:center;}
`.trim();

    tmpl = tmpl.replace("</head>", `<style id="__rsvp_styles">${rsvpCss}</style>\n</head>`);
  }

  // Replace RSVP section with {{rsvpForm}}
  tmpl = tmpl.replace(/<!-- RSVP -->[\s\S]*?<\/section>/, "{{rsvpForm}}");

  // Convert <sc-for list="{{ schedule }}"> → static HTML
  tmpl = tmpl.replace(/<sc-for[^>]*"\{\{ schedule \}\}"[^>]*>([\s\S]*?)<\/sc-for>/g, (_m, inner) => {
    const wStyle = inner.match(/<div style="([^"]+)">/)?.[1] ?? "";
    const tStyle = inner.match(/<div style="([^"]+)">\{\{ item\.time \}\}/)?.[1] ?? "";
    const tiStyle = inner.match(/<div style="([^"]+)">\{\{ item\.title \}\}/)?.[1] ?? "";
    const schedule = [["11:00 AM", "Thanksgiving Service"], ["1:00 PM", "Reception &amp; Luncheon"], ["2:30 PM", "Tributes &amp; Toasts"], ["4:00 PM", "Cake Cutting &amp; Dancing"]];
    return schedule.map(([time, title]) => `<div style="${wStyle}"><div style="${tStyle}">${time}</div><div style="${tiStyle}">${title}</div></div>`).join("");
  });

  return tmpl;
}

function replaceTargetElement(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const target = doc.querySelector('[data-rsvp-target="1"]');
  if (!target) return html;

  // Replace only INNER content — the container element keeps its id/class so the
  // design's navigation JS can still show/hide it normally.
  target.removeAttribute("data-rsvp-target");
  target.innerHTML = "{{rsvpForm}}";

  // DOMParser's outerHTML drops the DOCTYPE, causing quirks mode which breaks
  // layout-dependent scripts like countdown timers. Restore it from the original.
  const doctypeMatch = html.match(/<!DOCTYPE[^>]*>/i);
  const doctype = doctypeMatch ? doctypeMatch[0] : "<!DOCTYPE html>";
  return doctype + "\n" + doc.documentElement.outerHTML;
}

function makePreviewBlob(html: string): string {
  const withMarker = html.replace(
    "{{rsvpForm}}",
    `<div style="background:#5a2231;color:#fff;padding:40px 24px;text-align:center;border-radius:10px;margin:24px 0;font-family:inherit;">
       <div style="font-size:2rem;margin-bottom:10px;">📋</div>
       <p style="font-size:1rem;font-weight:600;margin:0;">RSVP Form will appear here</p>
     </div>`
  );
  const blob = new Blob([withMarker], { type: "text/html" });
  return URL.createObjectURL(blob);
}

interface ImageInfo {
  src: string;
  alt: string;
}

function extractImages(html: string): ImageInfo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgs = Array.from(doc.querySelectorAll("img[src]"));
  const seen = new Set<string>();
  const result: ImageInfo[] = [];
  for (const img of imgs) {
    const src = img.getAttribute("src") ?? "";
    if (!src || seen.has(src)) continue;
    seen.add(src);
    result.push({ src, alt: img.getAttribute("alt") ?? "" });
  }
  return result;
}

function isCloudinary(src: string) {
  return src.includes("res.cloudinary.com");
}

function srcLabel(src: string): string {
  try {
    const u = new URL(src, "http://x");
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || src;
  } catch {
    return src.split("/").pop() || src;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EventDesignPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [selecting, setSelecting] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [uploadingSet, setUploadingSet] = useState<Set<string>>(new Set());
  const [uploadErrors, setUploadErrors] = useState<Map<string, string>>(new Map());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevBlobRef = useRef<string>("");

  const hasPlaceholder = htmlContent.includes("{{rsvpForm}}");
  const images = useMemo(() => (htmlContent ? extractImages(htmlContent) : []), [htmlContent]);
  const pendingImages = images.filter((img) => !isCloudinary(img.src));

  // ── Fetch event ──────────────────────────────────────────────────────────────

  useEffect(() => { if (eventId) fetchEvent(); }, [eventId]);

  async function fetchEvent() {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
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

  // ── Preview blob ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab !== "preview" || !htmlContent) return;
    if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
    const url = makePreviewBlob(htmlContent);
    prevBlobRef.current = url;
    setPreviewSrc(url);
  }, [activeTab, htmlContent]);

  useEffect(() => () => { if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current); }, []);

  // ── Selection mode ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selecting) return;
    function inject() {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc || !doc.body) return;
        const s = doc.createElement("script");
        s.setAttribute("data-rsvp-injected", "1");
        s.textContent = SELECTION_SCRIPT;
        doc.body.appendChild(s);
      } catch {
        setToast({ message: "Could not activate selection mode", type: "error" });
        setSelecting(false);
      }
    }
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (iframe.contentDocument?.readyState === "complete") inject();
    else iframe.addEventListener("load", inject, { once: true });
  }, [selecting]);

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.data?.type !== "__rsvp_sel") return;
    const modified = replaceTargetElement(e.data.html as string);
    if (modified === e.data.html) {
      setToast({ message: "Couldn't identify that element — try clicking a containing <div> or <section>", type: "error" });
      setSelecting(false);
      return;
    }
    setHtmlContent(modified);
    setSelecting(false);
  }, []);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  function startSelection() {
    setActiveTab("preview");
    setSelecting(true);
  }

  function cancelSelection() {
    setSelecting(false);
    try {
      iframeRef.current?.contentDocument?.querySelectorAll("[data-rsvp-injected]").forEach((n) => n.remove());
      const body = iframeRef.current?.contentDocument?.body;
      if (body) body.style.cursor = "";
    } catch {}
  }

  // ── File upload ───────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.html?$/i)) {
      setToast({ message: "Please upload an HTML file (.html or .htm)", type: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const extracted = extractClaudeBundle(raw);
      const html = extracted ?? raw;
      if (extracted) {
        setToast({ message: "Claude artifact bundle detected — converted to plain HTML automatically", type: "success" });
      }
      setHtmlContent(html);
      setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      setActiveTab("upload");
      setSelecting(false);
      setUploadingSet(new Set());
      setUploadErrors(new Map());
    };
    reader.readAsText(file);
  }

  // ── Image upload ──────────────────────────────────────────────────────────────

  async function uploadImage(originalSrc: string, file: File) {
    setUploadingSet((prev) => new Set(prev).add(originalSrc));
    setUploadErrors((prev) => { const m = new Map(prev); m.delete(originalSrc); return m; });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const { url } = await res.json();
      // Replace all occurrences of this src in the HTML
      setHtmlContent((prev) => prev.replaceAll(originalSrc, url));
      setUploadingSet((prev) => { const s = new Set(prev); s.delete(originalSrc); return s; });
      setToast({ message: "Image uploaded to Cloudinary", type: "success" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadErrors((prev) => new Map(prev).set(originalSrc, msg));
      setUploadingSet((prev) => { const s = new Set(prev); s.delete(originalSrc); return s; });
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!htmlContent) { setToast({ message: "No HTML file loaded", type: "error" }); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/design`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designContent: htmlContent }),
      });
      if (res.ok) {
        setToast({ message: "Design saved successfully", type: "success" });
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ message: data.error || "Failed to save design", type: "error" });
      }
    } catch {
      setToast({ message: "Failed to save design", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    if (!confirm("Remove the uploaded design? This cannot be undone.")) return;
    setHtmlContent("");
    setFileName("");
    setActiveTab("upload");
    setSelecting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Render ────────────────────────────────────────────────────────────────────

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
          <p className="text-muted text-sm">{event?.title ?? "Loading..."}</p>
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
            {/* Tab buttons */}
            <div className="flex rounded-lg border border-line overflow-hidden">
              {(["upload", "preview", "images"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); if (tab !== "preview") setSelecting(false); }}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab ? "bg-burgundy text-white" : "hover:bg-cream"
                  }`}
                >
                  {tab === "upload" && "Upload"}
                  {tab === "preview" && "Preview"}
                  {tab === "images" && (
                    <>
                      Images
                      {pendingImages.length > 0 && (
                        <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          activeTab === "images" ? "bg-white/20 text-white" : "bg-red-100 text-red-700"
                        }`}>
                          {pendingImages.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* RSVP location controls — preview tab only */}
            {activeTab === "preview" && (
              selecting ? (
                <button
                  onClick={cancelSelection}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors"
                >
                  ✕ Cancel Selection
                </button>
              ) : hasPlaceholder ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded-full px-3 py-1">
                    ✓ RSVP location set
                  </span>
                  <button
                    onClick={startSelection}
                    className="px-3 py-1 text-xs font-medium border border-line rounded-full hover:bg-cream transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={startSelection}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gold text-white hover:bg-gold-dark transition-colors"
                >
                  📋 Select RSVP Location
                </button>
              )
            )}
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

      {/* Selection mode banner */}
      {selecting && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center gap-3">
          <span className="text-amber-600 text-lg">🎯</span>
          <p className="text-sm text-amber-800 font-medium">
            Selection mode active — hover over elements in the preview and click the container where the RSVP form should appear.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main area */}
        <div className="lg:col-span-2">

          {/* ── Upload tab ── */}
          {activeTab === "upload" && (
            <div className="space-y-4">
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
                    <p className="text-xs text-muted">{fileName}</p>
                    <p className="text-xs text-gold mt-3 font-medium">Click to replace</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-ink mb-1">Upload your AI-generated HTML design</p>
                    <p className="text-xs text-muted text-center">Drag &amp; drop or click to browse · accepts .html files</p>
                  </>
                )}
              </div>

              {htmlContent && (
                <div className="bg-white border border-line rounded-lg p-4 flex items-start gap-3">
                  <div className="text-2xl mt-0.5">✅</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{fileName}</p>
                    <p className="text-xs text-muted mt-0.5">{(htmlContent.length / 1024).toFixed(1)} KB · {images.length} image{images.length !== 1 ? "s" : ""} found</p>
                    {pendingImages.length > 0 && (
                      <p className="text-xs text-amber-700 mt-1">⚠ {pendingImages.length} image{pendingImages.length !== 1 ? "s" : ""} need uploading — go to the Images tab</p>
                    )}
                    {!hasPlaceholder && (
                      <p className="text-xs text-muted mt-1">Switch to Preview and click "Select RSVP Location" to mark where the form appears.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="text-xs px-3 py-1.5 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors whitespace-nowrap"
                  >
                    Open Preview →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Preview tab ── */}
          {activeTab === "preview" && (
            <div className="bg-white rounded-lg border border-line overflow-hidden">
              <div className="px-4 py-2 bg-cream border-b border-line flex items-center justify-between">
                <span className="text-sm font-medium text-ink">
                  {selecting ? "🎯 Click a container in the design below" : "Preview"}
                </span>
                <span className="text-xs text-muted">
                  {hasPlaceholder
                    ? "Burgundy block marks where the RSVP form will appear"
                    : "No RSVP location selected yet"}
                </span>
              </div>
              {previewSrc ? (
                <iframe
                  ref={iframeRef}
                  src={previewSrc}
                  title="Design preview"
                  className="w-full border-0 block"
                  style={{ height: 680, cursor: selecting ? "crosshair" : "default" }}
                />
              ) : (
                <div className="p-12 text-center text-muted text-sm">Building preview…</div>
              )}
            </div>
          )}

          {/* ── Images tab ── */}
          {activeTab === "images" && (
            <div className="space-y-3">
              {images.length === 0 ? (
                <div className="bg-white border border-line rounded-lg p-8 text-center text-muted text-sm">
                  No &lt;img&gt; tags found in the uploaded HTML.
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted">
                    {pendingImages.length === 0
                      ? "All images have been uploaded to Cloudinary."
                      : `${pendingImages.length} of ${images.length} image${images.length !== 1 ? "s" : ""} still need uploading. Upload each one to fix broken images in the design.`}
                  </p>

                  {images.map((img) => {
                    const uploading = uploadingSet.has(img.src);
                    const error = uploadErrors.get(img.src);
                    const uploaded = isCloudinary(img.src);
                    return (
                      <div
                        key={img.src}
                        className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-colors ${
                          uploaded ? "border-green-200 bg-green-50/40" : "border-line"
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-14 bg-cream rounded overflow-hidden flex-shrink-0 border border-line">
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.15";
                              e.currentTarget.style.filter = "grayscale(1)";
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {img.alt || srcLabel(img.src) || "Image"}
                          </p>
                          <p className="text-[11px] text-muted truncate font-mono">{img.src}</p>
                          {uploaded && (
                            <p className="text-[11px] text-green-700 mt-1 font-medium">✓ Cloudinary</p>
                          )}
                          {error && (
                            <p className="text-[11px] text-red-600 mt-1">{error}</p>
                          )}
                        </div>

                        {/* Upload control */}
                        <label className={`flex-shrink-0 ${uploading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadImage(img.src, file);
                              e.target.value = "";
                            }}
                          />
                          <span
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors block text-center min-w-[80px] ${
                              uploading
                                ? "opacity-50 border-line text-muted"
                                : uploaded
                                  ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                  : "border-line text-ink hover:bg-cream"
                            }`}
                          >
                            {uploading ? "Uploading…" : uploaded ? "Replace" : "Upload"}
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-cream rounded-lg border border-line p-4">
            <h3 className="font-medium text-ink mb-3">Workflow</h3>
            <ol className="text-xs text-muted space-y-3 leading-relaxed list-none">
              {[
                ["📄", "Upload", "Upload your AI-generated HTML event page"],
                ["🖼️", "Images", "Replace broken images by uploading to Cloudinary"],
                ["👁️", "Preview", "Open the Preview tab to see how it looks"],
                ["🎯", "Select", 'Click "Select RSVP Location" and click the container where the form should appear'],
                ["💾", "Save", "Save Design — the RSVP form is injected automatically on the live page"],
              ].map(([icon, label, desc]) => (
                <li key={label} className="flex gap-3">
                  <span className="text-base leading-none mt-0.5">{icon}</span>
                  <span><strong className="text-ink font-medium">{label}</strong> — {desc}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-white rounded-lg border border-line p-4">
            <h3 className="font-medium text-ink mb-2">Optional placeholders</h3>
            <div className="space-y-1 text-xs text-muted">
              {[
                ["{{eventTitle}}", "Event name"],
                ["{{eventDate}}", "Formatted date"],
                ["{{eventTime}}", "Formatted time"],
                ["{{venue}}", "Venue name"],
              ].map(([ph, desc]) => (
                <p key={ph}><code className="bg-cream px-1 rounded">{ph}</code> — {desc}</p>
              ))}
              <p className="mt-2 text-[10px] leading-relaxed">
                Add these to your HTML and they'll be replaced automatically on the live page.
              </p>
            </div>
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
