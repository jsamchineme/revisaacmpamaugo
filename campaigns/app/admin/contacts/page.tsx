"use client";

import { useState, useEffect } from "react";
import ContactForm from "@/components/admin/ContactForm";
import CsvImport from "@/components/admin/CsvImport";
import Toast from "@/components/admin/Toast";

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

type ModalMode = "add" | "edit" | "import" | null;

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [search]);

  async function fetchContacts() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const response = await fetch(`/api/admin/contacts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(data: { name: string; phone: string; email: string }) {
    setFormLoading(true);
    try {
      const response = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to add contact");
      }
      setModalMode(null);
      fetchContacts();
      setToast({ message: "Contact added", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to add contact");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEdit(data: { name: string; phone: string; email: string }) {
    if (!editContact) return;
    setFormLoading(true);
    try {
      const response = await fetch(`/api/admin/contacts/${editContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update contact");
      }
      setModalMode(null);
      setEditContact(null);
      fetchContacts();
      setToast({ message: "Contact updated", type: "success" });
    } catch (err: any) {
      setError(err.message || "Failed to update contact");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete contact");
      setContacts(contacts.filter((c) => c.id !== id));
      setDeleteId(null);
      setToast({ message: "Contact deleted", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to delete contact", type: "error" });
      setDeleteId(null);
    }
  }

  function handleImportComplete() {
    fetchContacts();
    setToast({ message: "Contacts imported", type: "success" });
  }

  function openEdit(contact: Contact) {
    setEditContact(contact);
    setModalMode("edit");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading contacts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setModalMode("import")}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
          >
            Import CSV
          </button>
          <button
            onClick={() => setModalMode("add")}
            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
          >
            Add Contact
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-2 text-sm underline flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Added
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-cream/50">
                  <td className="px-4 py-3 font-medium">{contact.name}</td>
                  <td className="px-4 py-3 text-sm">{contact.phone || "-"}</td>
                  <td className="px-4 py-3 text-sm">{contact.email || "-"}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(contact)}
                        className="px-3 py-1 text-sm bg-gold text-white rounded hover:bg-gold-dark transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(contact.id)}
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
        </div>

        {!loading && !error && contacts.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-lg text-muted font-medium mb-1">No contacts yet</p>
            <p className="text-sm text-muted mb-4">
              Import your first CSV or add contacts manually.
            </p>
            <button
              onClick={() => setModalMode("import")}
              className="inline-block px-5 py-2.5 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition-colors"
            >
              Import CSV
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {modalMode === "add" ? "Add Contact" : "Edit Contact"}
              </h2>
              <button
                onClick={() => {
                  setModalMode(null);
                  setEditContact(null);
                }}
                className="text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>
            <ContactForm
              initialData={
                modalMode === "edit" && editContact
                  ? {
                      name: editContact.name,
                      phone: editContact.phone || "",
                      email: editContact.email || "",
                    }
                  : undefined
              }
              onSubmit={modalMode === "add" ? handleAdd : handleEdit}
              onCancel={() => {
                setModalMode(null);
                setEditContact(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {modalMode === "import" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Import Contacts from CSV</h2>
              <button
                onClick={() => setModalMode(null)}
                className="text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>
            <CsvImport onImport={handleImportComplete} />
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this contact? This action cannot be
              undone.
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

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
