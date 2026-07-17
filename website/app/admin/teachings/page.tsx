"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Teaching {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  scriptureRef: string | null;
  published: boolean;
  createdAt: string;
}

export default function TeachingsPage() {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTeachings();
  }, [search, category]);

  async function fetchTeachings() {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const response = await fetch(`/api/admin/teachings?${params}`);
      const data = await response.json();
      setTeachings(data);
    } catch (error) {
      console.error("Error fetching teachings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/teachings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTeachings(teachings.filter((t) => t.id !== id));
        setDeleteId(null);
      }
    } catch (error) {
      console.error("Error deleting teaching:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading teachings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teachings</h1>
        <Link
          href="/admin/teachings/new"
          className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors"
        >
          Add Teaching
        </Link>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search teachings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">All Categories</option>
          <option value="Bible Study">Bible Study</option>
          <option value="Devotional">Devotional</option>
          <option value="Theology">Theology</option>
          <option value="Practical">Practical</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Scripture
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {teachings.map((teaching) => (
              <tr key={teaching.id} className="hover:bg-cream/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{teaching.title}</div>
                  <div className="text-sm text-muted">{teaching.slug}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {teaching.category || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {teaching.scriptureRef || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      teaching.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {teaching.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/teachings/${teaching.id}/edit`}
                      className="px-3 py-1 text-sm bg-gold text-white rounded hover:bg-gold-dark transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(teaching.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {teachings.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No teachings found. Create your first teaching to get started.
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this teaching? This action cannot
              be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
