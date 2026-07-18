"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Campaign {
  id: string;
  title: string;
  whatsappTemplateSid: string | null;
  link: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, [search]);

  async function fetchCampaigns() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/campaigns?${params}`);
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError("Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCampaigns(campaigns.filter((c) => c.id !== id));
        setDeleteId(null);
        setToast({ message: "Campaign deleted", type: "success" });
      } else {
        setToast({ message: "Failed to delete campaign", type: "error" });
        setDeleteId(null);
      }
    } catch (err) {
      setToast({ message: "Failed to delete campaign", type: "error" });
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link
          href="/admin/campaigns/new"
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors text-center"
        >
          New Campaign
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

      <div>
        <input
          type="text"
          placeholder="Search campaigns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{campaign.title}</div>
                    <div className="text-sm text-muted truncate max-w-xs">
                      {campaign.link}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {campaign.whatsappTemplateSid || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={`/admin/campaigns/${campaign.id}/send`}
                        className="px-3 py-1 text-sm bg-burgundy text-white rounded hover:bg-burgundy-dark transition-colors"
                      >
                        Send
                      </Link>
                      <Link
                        href={`/admin/campaigns/${campaign.id}/contacts`}
                        className="px-3 py-1 text-sm border border-line rounded hover:bg-cream transition-colors"
                      >
                        Contacts
                      </Link>
                      <Link
                        href={`/admin/campaigns/${campaign.id}/analytics`}
                        className="px-3 py-1 text-sm border border-line rounded hover:bg-cream transition-colors"
                      >
                        Analytics
                      </Link>
                      <Link
                        href={`/admin/campaigns/${campaign.id}/edit`}
                        className="px-3 py-1 text-sm bg-gold text-white rounded hover:bg-gold-dark transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(campaign.id)}
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

        {!loading && !error && campaigns.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-lg text-muted font-medium mb-1">No campaigns yet</p>
            <p className="text-sm text-muted mb-4">
              Create your first campaign to get started.
            </p>
            <Link
              href="/admin/campaigns/new"
              className="inline-block px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
            >
              Create Campaign
            </Link>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this campaign? This action cannot be
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
