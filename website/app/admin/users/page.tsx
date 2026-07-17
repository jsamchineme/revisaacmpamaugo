"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setFormData(emptyForm);
    setError("");
    setMode("create");
    setEditingId(null);
  }

  function startEdit(user: User) {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setError("");
    setMode("edit");
    setEditingId(user.id);
  }

  function cancelForm() {
    setMode("list");
    setEditingId(null);
    setFormData(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to create user");
          return;
        }

        cancelForm();
        fetchUsers();
      } else if (mode === "edit" && editingId) {
        const payload = { ...formData };
        if (!payload.password) {
          delete (payload as Record<string, unknown>).password;
        }

        const res = await fetch(`/api/admin/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to update user");
          return;
        }

        cancelForm();
        fetchUsers();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete user");
        return;
      }
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted">Loading users...</div>
      </div>
    );
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-ink">Users</h1>
        {isAdmin && mode === "list" && (
          <button
            onClick={startCreate}
            className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors text-sm font-medium"
          >
            Add User
          </button>
        )}
      </div>

      {(mode === "create" || mode === "edit") && isAdmin && (
        <div className="bg-white rounded-xl border border-line p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">
            {mode === "create" ? "Create New User" : "Edit User"}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-paper"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-paper"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Password {mode === "edit" && "(leave blank to keep unchanged)"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={mode === "create"}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-paper"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-paper"
              >
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
                <option value="AUTHOR">Author</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {submitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create User"
                    : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-6 py-2 border border-line text-ink rounded-lg hover:bg-cream transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-ink">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-ink">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-ink">Role</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-ink">Joined</th>
              {isAdmin && <th className="px-6 py-3 text-left text-sm font-medium text-ink">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-muted text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-ink">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-muted">{user.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-burgundy text-white"
                          : user.role === "EDITOR"
                            ? "bg-gold text-white"
                            : "bg-cream text-ink border border-line"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-sm text-gold-dark hover:text-gold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-sm text-red-600 hover:text-red-800 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
