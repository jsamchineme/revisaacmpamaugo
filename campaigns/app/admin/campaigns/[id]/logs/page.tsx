"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface SendLogEntry {
  id: string;
  channel: string;
  status: string;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  contactName: string;
}

export default function CampaignLogsPage() {
  const params = useParams();
  const id = params.id as string;

  const [logs, setLogs] = useState<SendLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all"); // "all" | "whatsapp" | "email"

  useEffect(() => {
    if (id) {
      fetchLogs();
    }
  }, [id, filter]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("channel", filter);
      }
      const response = await fetch(
        `/api/admin/campaigns/${id}/logs?${params}`
      );
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data: SendLogEntry[] = await response.json();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || "Failed to load send logs");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;
  const pendingCount = logs.filter((l) => l.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Send Logs</h1>
          <p className="text-muted text-sm">
            Per-contact delivery status for this campaign
          </p>
        </div>
        <Link
          href={`/admin/campaigns/${id}/send`}
          className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Back to Send
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-line rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{sentCount}</div>
          <div className="text-sm text-muted">Sent</div>
        </div>
        <div className="bg-white border border-line rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          <div className="text-sm text-muted">Failed</div>
        </div>
        <div className="bg-white border border-line rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-muted">Pending</div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-sm underline flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Channel Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Filter:</span>
        {(["all", "whatsapp", "email"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              filter === f
                ? "bg-gold text-white"
                : "border border-line hover:bg-cream"
            }`}
          >
            {f === "all" ? "All" : f === "whatsapp" ? "WhatsApp" : "Email"}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Contact Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Channel
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Sent At
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Error
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-cream/50">
                <td className="px-4 py-3 font-medium">{log.contactName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      log.channel === "whatsapp"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {log.channel === "whatsapp" ? "WhatsApp" : "Email"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      log.status === "sent"
                        ? "bg-green-100 text-green-700"
                        : log.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {formatDate(log.sentAt)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {log.errorMessage ? (
                    <span className="text-red-600 text-xs">{log.errorMessage}</span>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && logs.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No send logs found for this campaign.
          </div>
        )}

        {loading && (
          <div className="px-4 py-8 text-center text-muted">
            <div className="animate-pulse">Loading logs...</div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
