"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SermonForm from "../../SermonForm";

export default function EditSermonPage() {
  const params = useParams();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSermon() {
      try {
        const response = await fetch(`/api/admin/sermons/${params.id}`);
        const data = await response.json();
        setSermon(data);
      } catch (error) {
        console.error("Error fetching sermon:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchSermon();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading sermon...</div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Sermon not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Sermon</h1>
      <SermonForm initialData={sermon} sermonId={params.id as string} />
    </div>
  );
}
