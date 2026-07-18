"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TiptapEditor } from "@/components/admin/tiptap/TiptapEditor";
import ImageUpload from "@/components/ImageUpload";

interface SermonFormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  scriptureRef: string;
  imageUrl: string;
  audioUrl: string;
  videoUrl: string;
  body: string;
  published: boolean;
}

interface SermonFormProps {
  initialData?: Partial<SermonFormData>;
  sermonId?: string;
}

export default function SermonForm({ initialData, sermonId }: SermonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SermonFormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    scriptureRef: initialData?.scriptureRef || "",
    imageUrl: initialData?.imageUrl || "",
    audioUrl: initialData?.audioUrl || "",
    videoUrl: initialData?.videoUrl || "",
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
      const url = sermonId
        ? `/api/admin/sermons/${sermonId}`
        : "/api/admin/sermons";
      const method = sermonId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/sermons");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save sermon");
      }
    } catch (error) {
      console.error("Error saving sermon:", error);
      alert("Failed to save sermon");
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
            <option value="Sunday Service">Sunday Service</option>
            <option value="Special Service">Special Service</option>
            <option value="Conference">Conference</option>
            <option value="Revival">Revival</option>
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

        <div className="space-y-2 md:col-span-2">
          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            label="Featured Image"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Audio URL</label>
          <input
            type="url"
            name="audioUrl"
            value={formData.audioUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Video URL</label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
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
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Body</label>
        <TiptapEditor
          value={formData.body}
          onChange={(html) => setFormData((prev) => ({ ...prev, body: html }))}
          placeholder="Write the sermon body..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : sermonId ? "Update Sermon" : "Create Sermon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/sermons")}
          className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
