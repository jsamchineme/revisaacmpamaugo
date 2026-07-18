"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  description: string | null;
  capacity: number | null;
  imageUrl: string | null;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/admin/events");
        if (!response.ok) throw new Error("Failed to fetch events");
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEvents(events.filter((e) => e.id !== id));
        setDeleteId(null);
        setToast({ message: "Event deleted", type: "success" });
      } else {
        setToast({ message: "Failed to delete event", type: "error" });
        setDeleteId(null);
      }
    } catch (err) {
      setToast({ message: "Failed to delete event", type: "error" });
      setDeleteId(null);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors text-center"
        >
          Create Event
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-sm underline flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Capacity
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-muted line-clamp-1">
                        {event.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">{event.slug}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(event.date)}</td>
                  <td className="px-4 py-3 text-sm">
                    {event.capacity ?? "Unlimited"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="px-3 py-1 text-sm bg-gold text-white rounded hover:bg-gold-dark transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(event.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && events.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-lg text-muted font-medium mb-1">No events yet</p>
            <p className="text-sm text-muted mb-4">
              Create your first event to get started.
            </p>
            <Link
              href="/admin/events/new"
              className="inline-block px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
            >
              Create Event
            </Link>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
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
