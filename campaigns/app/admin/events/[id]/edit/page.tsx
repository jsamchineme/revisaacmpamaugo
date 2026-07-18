"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import { EventFormData } from "@/lib/validations";

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Partial<EventFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/admin/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const data = await response.json();
        // Format date for datetime-local input: YYYY-MM-DDTHH:mm
        const dateObj = new Date(data.date);
        const formattedDate = dateObj.toISOString().slice(0, 16);
        setEvent({
          title: data.title,
          slug: data.slug,
          date: formattedDate,
          description: data.description || "",
          capacity: data.capacity,
          imageUrl: data.imageUrl || "",
        });
      } catch (err) {
        setError("Failed to load event");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading event...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">{error || "Event not found"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Event</h1>
      <EventForm initialData={event} eventId={id} />
    </div>
  );
}
