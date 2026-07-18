"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Registration {
  id: string;
  eventId: string;
  title: string;
  fullname: string;
  phone: string;
  email: string | null;
  plusOne: boolean;
  plusOneGuests: string | null;
  whatsappOptIn: boolean;
  createdAt: string;
}

interface EventInfo {
  id: string;
  title: string;
  slug: string;
}

export default function RegistrationsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappOnly, setWhatsappOnly] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/admin/events/${eventId}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError("Failed to load event details.");
      }
    }

    async function fetchRegistrations() {
      setLoading(true);
      setError(null);
      try {
        const url = `/api/admin/events/${eventId}/registrations?whatsappOnly=${whatsappOnly}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch registrations");
        const data = await response.json();
        setRegistrations(data);
      } catch (err) {
        setError("Failed to load registrations. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
      fetchRegistrations();
    }
  }, [eventId, whatsappOnly]);

  function handleExport() {
    const url = `/api/admin/events/${eventId}/registrations/export?whatsappOnly=${whatsappOnly}`;
    window.location.href = url;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getTotalCount(): number {
    let count = registrations.length;
    for (const reg of registrations) {
      if (reg.plusOne && reg.plusOneGuests) {
        try {
          const guests = JSON.parse(reg.plusOneGuests);
          if (Array.isArray(guests)) {
            count += guests.length;
          }
        } catch {
          // ignore invalid JSON
        }
      }
    }
    return count;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading registrations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Registrations</h1>
          {event && (
            <p className="text-sm text-muted mt-1">
              {event.title} · {getTotalCount()} attendee{getTotalCount() !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={registrations.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              registrations.length === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-burgundy text-white hover:bg-burgundy-dark"
            }`}
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-sm underline flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setWhatsappOnly(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !whatsappOnly
              ? "bg-burgundy text-white"
              : "bg-cream text-muted hover:bg-cream/80 border border-line"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setWhatsappOnly(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            whatsappOnly
              ? "bg-green-600 text-white"
              : "bg-cream text-muted hover:bg-cream/80 border border-line"
          }`}
        >
          WhatsApp Group Only
        </button>
      </div>

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Plus-One
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  WhatsApp
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Registered At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3 text-sm">{reg.title}</td>
                  <td className="px-4 py-3 text-sm font-medium">{reg.fullname}</td>
                  <td className="px-4 py-3 text-sm">{reg.phone}</td>
                  <td className="px-4 py-3 text-sm">{reg.email || "-"}</td>
                  <td className="px-4 py-3">
                    {reg.plusOne ? (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Yes
                        {reg.plusOneGuests && (
                          <span className="ml-1">
                            (
                            {(() => {
                              try {
                                const guests = JSON.parse(reg.plusOneGuests);
                                return Array.isArray(guests) ? guests.length : 0;
                              } catch {
                                return 0;
                              }
                            })()}
                            )
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {reg.whatsappOptIn ? (
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Opted In
                      </span>
                    ) : (
                      <span className="text-sm text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(reg.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && registrations.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            <p className="text-lg font-medium mb-1">No registrations yet</p>
            <p className="text-sm">
              Registrations will appear here once people RSVP for this event.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-start">
        <Link
          href="/admin/events"
          className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
        >
          ← Back to Events
        </Link>
      </div>
    </div>
  );
}
