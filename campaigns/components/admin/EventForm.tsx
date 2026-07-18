"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormData } from "@/lib/validations";

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  eventId?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function EventForm({ initialData, eventId }: EventFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      date: initialData?.date || "",
      description: initialData?.description || "",
      capacity: initialData?.capacity?.toString() ?? "",
      imageUrl: initialData?.imageUrl || "",
    },
  });

  function handleTitleBlur() {
    const currentTitle = getValues("title");
    const currentSlug = getValues("slug");
    if (!currentSlug && currentTitle) {
      setValue("slug", slugify(currentTitle));
    }
  }

  async function onSubmit(data: EventFormData) {
    try {
      const url = eventId
        ? `/api/admin/events/${eventId}`
        : "/api/admin/events";
      const method = eventId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/admin/events");
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("title")}
            onBlur={handleTitleBlur}
            placeholder="Event title"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("slug")}
            placeholder="auto-generated-from-title"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {errors.slug && (
            <p className="text-sm text-red-500">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register("date")}
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Capacity</label>
          <input
            type="number"
            {...register("capacity")}
            placeholder="Leave empty for unlimited"
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {errors.capacity && (
            <p className="text-sm text-red-500">{errors.capacity.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Image URL</label>
          <input
            type="text"
            {...register("imageUrl")}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
          />
          {errors.imageUrl && (
            <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          placeholder="Event description..."
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : eventId
              ? "Update Event"
              : "Create Event"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/events")}
          className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
