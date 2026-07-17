"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TeachingForm from "../../TeachingForm";

export default function EditTeachingPage() {
  const params = useParams();
  const [teaching, setTeaching] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeaching() {
      try {
        const response = await fetch(`/api/admin/teachings/${params.id}`);
        const data = await response.json();
        setTeaching(data);
      } catch (error) {
        console.error("Error fetching teaching:", error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchTeaching();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading teaching...</div>
      </div>
    );
  }

  if (!teaching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-500">Teaching not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Teaching</h1>
      <TeachingForm initialData={teaching} teachingId={params.id as string} />
    </div>
  );
}
