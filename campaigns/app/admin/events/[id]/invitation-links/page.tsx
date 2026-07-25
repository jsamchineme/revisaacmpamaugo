"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const GUEST_SLUGS: Record<number, string> = {
  1: "guestone",
  2: "guestwo",
  3: "guesthree",
  4: "guestfour",
  5: "guestfive",
};

interface InvitationLink {
  id: string;
  eventId: string;
  noi: number;
  code: string;
  label: string | null;
  createdAt: string;
}

interface EventInfo {
  id: string;
  title: string;
  slug: string;
}

export default function InvitationLinksPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [links, setLinks] = useState<InvitationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [noi, setNoi] = useState(1);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [evtRes, linksRes] = await Promise.all([
        fetch(`/api/admin/events/${id}`),
        fetch(`/api/admin/events/${id}/invitation-links`),
      ]);
      if (evtRes.ok) setEvent(await evtRes.json());
      if (linksRes.ok) setLinks(await linksRes.json());
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function buildUrl(link: InvitationLink): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/${event?.slug}/${link.code}/${GUEST_SLUGS[link.noi]}`;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/events/${id}/invitation-links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noi, label: label.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create link");
        return;
      }
      setLabel("");
      setNoi(1);
      await fetchData();
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(linkId: string) {
    if (!confirm("Delete this invitation link?")) return;
    await fetch(`/api/admin/events/${id}/invitation-links/${linkId}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }

  function copyLink(link: InvitationLink) {
    navigator.clipboard.writeText(buildUrl(link));
    setCopied(link.id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Invitation Links</h1>
        {event && <p className="text-sm text-muted mt-1">{event.title}</p>}
      </div>

      <form onSubmit={handleCreate} className="bg-cream border border-line rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-ink">Create new link</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">
            Number of guests allowed
          </label>
          <select
            value={noi}
            onChange={(e) => setNoi(Number(e.target.value))}
            className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">
            Label <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. The Okonkwo Family"
            className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={creating}
          className="px-5 py-2 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark disabled:opacity-50 transition-colors"
        >
          {creating ? "Generating…" : "Generate link"}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="font-semibold text-ink">{links.length} link{links.length !== 1 ? "s" : ""}</h2>

        {links.length === 0 && (
          <p className="text-sm text-muted">No links yet. Create one above.</p>
        )}

        {links.map((link) => {
          const url = buildUrl(link);
          return (
            <div key={link.id} className="bg-white border border-line rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-ink">
                      {link.noi} {link.noi === 1 ? "person" : "people"}
                    </span>
                    {link.label && (
                      <span className="text-sm text-muted">— {link.label}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 break-all font-mono">{url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyLink(link)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-line bg-cream hover:bg-cream/80 text-ink transition-colors"
                  >
                    {copied === link.id ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/admin/events" className="text-sm text-muted hover:text-ink transition-colors">
        ← Back to events
      </Link>
    </div>
  );
}
