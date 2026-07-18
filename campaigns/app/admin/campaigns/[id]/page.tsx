"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";

interface Campaign {
  id: string;
  title: string;
  whatsappTemplateSid: string | null;
  whatsappTemplateVariables: string | null;
  emailBody: string | null;
  link: string;
  createdAt: string;
  updatedAt: string;
}

interface CampaignContact {
  id: string;
  trackingUuid: string;
  status: string;
  contact: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
}

interface Stats {
  totalContacts: number;
  sentCount: number;
  clickedCount: number;
  clickRate: number | null;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentContacts, setRecentContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchStats();
      fetchRecentContacts();
    }
  }, [id]);

  async function fetchCampaign() {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`);
      if (!response.ok) throw new Error("Failed to load campaign");
      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      setError("Failed to load campaign data.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}/analytics`);
      if (!response.ok) return;
      const data = await response.json();
      setStats(data);
    } catch (err) {
      // Non-critical
    }
  }

  async function fetchRecentContacts() {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}/contacts?limit=5`);
      if (!response.ok) return;
      const data = await response.json();
      setRecentContacts(data.slice(0, 5));
    } catch (err) {
      // Non-critical
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/admin/campaigns/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setToast({ message: "Campaign deleted", type: "success" });
        setTimeout(() => router.push("/admin/campaigns"), 800);
      } else {
        setToast({ message: "Failed to delete campaign", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Failed to delete campaign", type: "error" });
    } finally {
      setDeleteId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading campaign...</div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <p className="text-muted text-sm">
            Created {new Date(campaign.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href={`/admin/campaigns/${id}/send`}
            className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors text-sm"
          >
            Send
          </Link>
          <Link
            href={`/admin/campaigns/${id}/contacts`}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Contacts
          </Link>
          <Link
            href={`/admin/campaigns/${id}/analytics`}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Analytics
          </Link>
          <Link
            href={`/admin/campaigns/${id}/logs`}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Logs
          </Link>
          <Link
            href={`/admin/campaigns/${id}/edit`}
            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors text-sm"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteId(id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Delete
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-line p-5">
            <p className="text-sm text-muted">Contacts</p>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {stats.totalContacts}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-line p-5">
            <p className="text-sm text-muted">Sent</p>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {stats.sentCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-line p-5">
            <p className="text-sm text-muted">Clicked</p>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {stats.clickedCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-line p-5">
            <p className="text-sm text-muted">Click Rate</p>
            <p className="font-serif text-3xl font-bold text-ink mt-2">
              {stats.clickRate !== null ? `${stats.clickRate}%` : "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Campaign Details */}
      <div className="bg-white rounded-lg border border-line p-6 space-y-4">
        <h2 className="text-lg font-medium">Campaign Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted">Destination Link</p>
            <a 
              href={campaign.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-burgundy hover:text-gold-dark underline break-all"
            >
              {campaign.link}
            </a>
          </div>
          
          <div>
            <p className="text-sm text-muted">WhatsApp Template</p>
            <p className="text-sm text-ink">
              {campaign.whatsappTemplateSid || "Not configured"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted">Template Variables</p>
            <p className="text-sm text-ink">
              {campaign.whatsappTemplateVariables || "name, link"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted">Last Updated</p>
            <p className="text-sm text-ink">
              {new Date(campaign.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {campaign.emailBody && (
          <div>
            <p className="text-sm text-muted mb-2">Email Body</p>
            <pre className="p-3 bg-cream rounded-lg text-sm whitespace-pre-wrap font-sans text-ink border border-line">
              {campaign.emailBody}
            </pre>
          </div>
        )}
      </div>

      {/* Recent Contacts */}
      {recentContacts.length > 0 && (
        <div className="bg-white rounded-lg border border-line overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Contacts</h2>
            <Link
              href={`/admin/campaigns/${id}/contacts`}
              className="text-sm text-burgundy hover:text-gold-dark underline"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentContacts.map((cc) => (
                  <tr key={cc.id} className="hover:bg-cream/50">
                    <td className="px-4 py-3 font-medium">{cc.contact.name}</td>
                    <td className="px-4 py-3 text-sm">{cc.contact.phone || "-"}</td>
                    <td className="px-4 py-3 text-sm">{cc.contact.email || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          cc.status === "sent"
                            ? "bg-green-100 text-green-700"
                            : cc.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {cc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
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
