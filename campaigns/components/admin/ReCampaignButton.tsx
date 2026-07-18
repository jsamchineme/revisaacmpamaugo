"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReCampaignButtonProps {
  contactIds: string[];
  disabled: boolean;
  originalLink: string;
  label?: string;
}

export default function ReCampaignButton({
  contactIds,
  disabled,
  originalLink,
  label = "Create Campaign from These Contacts",
}: ReCampaignButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create the new campaign
      const createRes = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          link: originalLink,
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create campaign");
      }

      const newCampaign = await createRes.json();
      const newCampaignId = newCampaign.id;

      if (!newCampaignId) {
        throw new Error("Campaign created but no ID returned");
      }

      // Step 2: Assign contacts to the new campaign
      const assignRes = await fetch(
        `/api/admin/campaigns/${newCampaignId}/contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactIds }),
        }
      );

      if (!assignRes.ok) {
        const data = await assignRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to assign contacts");
      }

      router.push("/admin/campaigns");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          if (!disabled) {
            setShowModal(true);
            setTitle("");
            setError(null);
          }
        }}
        disabled={disabled}
        title={disabled ? "No contacts to re-campaign" : undefined}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-burgundy text-white hover:bg-burgundy-dark"
        }`}
      >
        {label}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-lg font-bold">Create New Campaign</h2>
            <p className="text-sm text-muted">
              A new campaign will be created with {contactIds.length} contact
              {contactIds.length !== 1 ? "s" : ""} from this list.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter campaign title..."
                disabled={loading}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setTitle("");
                  setError(null);
                }}
                disabled={loading}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !title.trim()}
                className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Creating..." : "Create Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
