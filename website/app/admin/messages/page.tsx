"use client";

import { useState, useEffect } from "react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [search, filter]);

  async function fetchMessages() {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filter !== "all") params.append("read", filter === "read" ? "true" : "false");

      const response = await fetch(`/api/admin/messages?${params}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string, read: boolean) {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read }),
      });

      if (response.ok) {
        setMessages(
          messages.map((m) => (m.id === id ? { ...m, read } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read });
        }
      }
    } catch (error) {
      console.error("Error marking message:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessages(messages.filter((m) => m.id !== id));
        setDeleteId(null);
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Contact Messages
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 text-sm bg-red-500 text-white rounded-full">
              {unreadCount} unread
            </span>
          )}
        </h1>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search messages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "read" | "unread")}
          className="px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <table className="w-full">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Message
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {messages.map((message) => (
              <tr
                key={message.id}
                className={`hover:bg-cream/50 cursor-pointer ${
                  !message.read ? "bg-blue-50" : ""
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex w-3 h-3 rounded-full ${
                      message.read ? "bg-gray-300" : "bg-blue-500"
                    }`}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{message.name}</td>
                <td className="px-4 py-3 text-sm">{message.email}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">
                  {message.message}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(message.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(message.id, !message.read);
                      }}
                      className="px-3 py-1 text-sm bg-gold text-white rounded hover:bg-gold-dark transition-colors"
                    >
                      {message.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(message.id);
                      }}
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

        {messages.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No messages found.
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Message from {selectedMessage.name}</h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-muted hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted">Email</label>
                  <p>{selectedMessage.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted">Phone</label>
                  <p>{selectedMessage.phone || "-"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted">Date</label>
                <p>{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted">Message</label>
                <p className="mt-1 p-4 bg-cream rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleMarkRead(selectedMessage.id, !selectedMessage.read)}
                  className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
                >
                  {selectedMessage.read ? "Mark Unread" : "Mark Read"}
                </button>
                <button
                  onClick={() => setDeleteId(selectedMessage.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="text-muted mb-6">
              Are you sure you want to delete this message? This action cannot be
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
    </div>
  );
}
