"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

interface CampaignContact {
  id: string;
  trackingUuid: string;
  status: string;
  createdAt: string;
  contact: Contact;
}

interface Campaign {
  id: string;
  title: string;
}

export default function CampaignContactsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [assignedContacts, setAssignedContacts] = useState<CampaignContact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchAssignedContacts();
    }
  }, [id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchAvailableContacts();
    }, 200);
    return () => clearTimeout(timeout);
  }, [search]);

  async function fetchCampaign() {
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
    }
  }

  async function fetchAssignedContacts() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/campaigns/${id}/contacts`);
      if (!response.ok) throw new Error("Failed to fetch assigned contacts");
      const data = await response.json();
      setAssignedContacts(data);
    } catch (err) {
      setError("Failed to load assigned contacts.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableContacts() {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const response = await fetch(`/api/admin/contacts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setAvailableContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  }

  function toggleContact(contactId: string) {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  }

  async function handleAssign() {
    if (selectedContactIds.size === 0) return;

    setAssigning(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/campaigns/${id}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selectedContactIds) }),
      });

      if (response.status === 409) {
        const data = await response.json();
        setError(data.error || "Some contacts are already assigned to this campaign.");
      } else if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign contacts");
      } else {
        setSelectedContactIds(new Set());
        setSearch("");
        fetchAssignedContacts();
      }
    } catch (err: any) {
      setError(err.message || "Failed to assign contacts");
    } finally {
      setAssigning(false);
    }
  }

  async function handleDelete(contactId: string) {
    try {
      const response = await fetch(
        `/api/admin/campaigns/${id}/contacts?contactId=${encodeURIComponent(contactId)}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to remove assignment");
      setAssignedContacts((prev) =>
        prev.filter((cc) => cc.contact.id !== contactId)
      );
      setDeleteContactId(null);
    } catch (err) {
      setError("Failed to remove contact assignment.");
    }
  }

  if (loading && !campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {campaign ? campaign.title : "Campaign"}
          </h1>
          <p className="text-muted text-sm">Assign contacts to this campaign</p>
        </div>
        <button
          onClick={() => router.push("/admin/campaigns")}
          className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Back to Campaigns
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Contact Selector */}
      <div className="bg-white rounded-lg border border-line p-4 space-y-4">
        <h2 className="text-lg font-medium">Add Contacts</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        {availableContacts.length > 0 && (
          <div className="border border-line rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-cream">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted w-10">
                    <input
                      type="checkbox"
                      checked={
                        availableContacts.length > 0 &&
                        availableContacts.every((c) => selectedContactIds.has(c.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContactIds(
                            new Set(availableContacts.map((c) => c.id))
                          );
                        } else {
                          setSelectedContactIds(new Set());
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted">
                    Phone
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-muted">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {availableContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-cream/50 cursor-pointer"
                    onClick={() => toggleContact(contact.id)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedContactIds.has(contact.id)}
                        onChange={() => toggleContact(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{contact.name}</td>
                    <td className="px-4 py-2 text-sm">{contact.phone || "-"}</td>
                    <td className="px-4 py-2 text-sm">{contact.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {search && availableContacts.length === 0 && (
          <div className="text-center text-muted py-4">
            No contacts found matching &ldquo;{search}&rdquo;.
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleAssign}
            disabled={selectedContactIds.size === 0 || assigning}
            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {assigning
              ? "Assigning..."
              : `Assign Selected (${selectedContactIds.size})`}
          </button>
          {selectedContactIds.size > 0 && (
            <button
              onClick={() => setSelectedContactIds(new Set())}
              className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Assigned Contacts Table */}
      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="px-4 py-3 border-b border-line">
          <h2 className="text-lg font-medium">
            Assigned Contacts ({assignedContacts.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Tracking UUID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {assignedContacts.map((cc) => (
              <tr key={cc.id} className="hover:bg-cream/50">
                <td className="px-4 py-3 font-medium">{cc.contact.name}</td>
                <td className="px-4 py-3 text-sm">{cc.contact.phone || "-"}</td>
                <td className="px-4 py-3 text-sm">{cc.contact.email || "-"}</td>
                <td className="px-4 py-3 text-sm font-mono text-muted">
                  {cc.trackingUuid}
                </td>
                <td className="px-4 py-3 text-sm">
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
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDeleteContactId(cc.contact.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {assignedContacts.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No contacts assigned to this campaign yet.
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteContactId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Remove</h2>
            <p className="text-muted mb-6">
              Are you sure you want to remove this contact from the campaign?
              This will not delete the contact itself.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteContactId(null)}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteContactId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
