"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TeachingFormData {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  scriptureRef: string;
  imageUrl: string;
  body: string;
  published: boolean;
}

interface TeachingFormProps {
  initialData?: Partial<TeachingFormData>;
  teachingId?: string;
}

export default function TeachingForm({ initialData, teachingId }: TeachingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeachingFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    category: initialData?.category || "",
    scriptureRef: initialData?.scriptureRef || "",
    imageUrl: initialData?.imageUrl || "",
    body: initialData?.body || "",
    published: initialData?.published || false,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = teachingId
        ? `/api/admin/teachings/${teachingId}`
        : "/api/admin/teachings";
      const method = teachingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/teachings");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save teaching");
      }
    } catch (error) {
      console.error("Error saving teaching:", error);
      alert("Failed to save teaching");
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
          <label className="text-sm font-medium">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            pattern="[a-z0-9-]+"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          >
            <option value="">Select Category</option>
            <option value="Bible Study">Bible Study</option>
            <option value="Devotional">Devotional</option>
            <option value="Theology">Theology</option>
            <option value="Practical">Practical</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Scripture Reference</label>
          <input
            type="text"
            name="scriptureRef"
            value={formData.scriptureRef}
            onChange={handleChange}
            placeholder="e.g., John 3:16"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Image URL</label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2 flex items-center">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Published</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Excerpt</label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Body (TipTap JSON)</label>
        <textarea
          name="body"
          value={formData.body}
          onChange={handleChange}
          rows={10}
          placeholder='{"type":"doc","content":[...]}'
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold font-mono text-sm"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : teachingId ? "Update Teaching" : "Create Teaching"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/teachings")}
          className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
