"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TestimonialFormData {
  quote: string;
  author: string;
  role: string;
  order: number;
  published: boolean;
}

interface TestimonialFormProps {
  initialData?: Partial<TestimonialFormData>;
  testimonialId?: string;
}

export default function TestimonialForm({ initialData, testimonialId }: TestimonialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TestimonialFormData>({
    quote: initialData?.quote || "",
    author: initialData?.author || "",
    role: initialData?.role || "",
    order: initialData?.order || 0,
    published: initialData?.published ?? true,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? parseInt(value) || 0 : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = testimonialId
        ? `/api/admin/testimonials/${testimonialId}`
        : "/api/admin/testimonials";
      const method = testimonialId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save testimonial");
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save testimonial");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Author *</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Church Member"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Order</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
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
        <label className="text-sm font-medium">Quote *</label>
        <textarea
          name="quote"
          value={formData.quote}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : testimonialId ? "Update Testimonial" : "Create Testimonial"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/testimonials")}
          className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
