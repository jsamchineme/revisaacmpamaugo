"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CampaignFormData {
  title: string;
  whatsappTemplateSid: string;
  whatsappTemplateVariables: string;
  emailBody: string;
  link: string;
}

interface CampaignFormProps {
  initialData?: Partial<CampaignFormData>;
  resourceId?: string;
}

export default function CampaignForm({ initialData, resourceId }: CampaignFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: initialData?.title || "",
    whatsappTemplateSid: initialData?.whatsappTemplateSid || "",
    whatsappTemplateVariables: initialData?.whatsappTemplateVariables || "",
    emailBody: initialData?.emailBody || "",
    link: initialData?.link || "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = resourceId
        ? `/api/admin/campaigns/${resourceId}`
        : "/api/admin/campaigns";
      const method = resourceId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/campaigns");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save campaign");
      }
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("Failed to save campaign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Link *</label>
          <input
            type="url"
            name="link"
            value={formData.link}
            onChange={handleChange}
            required
            placeholder="https://..."
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">WhatsApp Template SID</label>
          <input
            type="text"
            name="whatsappTemplateSid"
            value={formData.whatsappTemplateSid}
            onChange={handleChange}
            placeholder="HX..."
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Template Variables</label>
          <input
            type="text"
            name="whatsappTemplateVariables"
            value={formData.whatsappTemplateVariables}
            onChange={handleChange}
            placeholder="name, link"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <p className="text-xs text-muted">
            Comma-separated from: name, link
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email Body</label>
        <textarea
          name="emailBody"
          value={formData.emailBody}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <p className="text-xs text-muted">
          Use {"{{link}}"} as a placeholder where the tracking link should appear. Example: <span className="text-ink font-medium">Click here to RSVP: {"{{link}}"}</span>. Do NOT put the actual URL here — set it in the Link field above. Each contact will receive their own unique tracking link.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : resourceId ? "Update Campaign" : "Create Campaign"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/campaigns")}
          className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
