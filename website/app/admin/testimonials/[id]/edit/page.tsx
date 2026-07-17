"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TestimonialForm from "../../TestimonialForm";

export default function EditTestimonialPage() {
  const params = useParams();
  const [testimonial, setTestimonial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonial() {
      try {
        const response = await fetch(`/api/admin/testimonials/${params.id}`);
        const data = await response.json();
        setTestimonial(data);
      } catch (error) {
        console.error("Error fetching testimonial:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTestimonial();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading testimonial...</div>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Testimonial not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Testimonial</h1>
      <TestimonialForm initialData={testimonial} testimonialId={params.id as string} />
    </div>
  );
}
