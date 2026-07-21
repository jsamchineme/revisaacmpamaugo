"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/admin/Toast";
import { FieldType, FormField, FormConfig } from "@/lib/form-config-types";

interface Event {
  id: string;
  title: string;
  slug: string;
  formConfig?: string;
}

const DEFAULT_FIELDS: FormField[] = [
  {
    id: "title",
    type: "select",
    label: "Title",
    required: true,
    options: ["Mr", "Mrs", "Ms", "Dr"],
  },
  {
    id: "fullname",
    type: "text",
    label: "Full Name",
    placeholder: "John Doe",
    required: true,
  },
  {
    id: "phone",
    type: "tel",
    label: "Phone",
    placeholder: "+2348012345678",
    required: true,
  },
  {
    id: "email",
    type: "email",
    label: "Email",
    placeholder: "john@example.com",
    required: false,
  },
  {
    id: "plusOne",
    type: "checkbox",
    label: "I'm coming with guests",
    required: false,
    conditional: ["guestCount", "guests"],
  },
  {
    id: "guestCount",
    type: "number",
    label: "Number of guests",
    required: false,
    max: 5,
    maxFromQuery: "noi",
  },
  {
    id: "guests",
    type: "guestGroup",
    label: "Guests",
    required: false,
    countField: "guestCount",
    max: 5,
    subFields: [
      {
        id: "title",
        type: "text",
        label: "Title",
        placeholder: "Mr, Mrs, Ms, Dr",
        required: true,
      },
      {
        id: "fullname",
        type: "text",
        label: "Full Name",
        placeholder: "Jane Doe",
        required: true,
      },
      {
        id: "phone",
        type: "tel",
        label: "Phone",
        placeholder: "+2348098765432",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "Email",
        placeholder: "jane@example.com",
        required: false,
      },
    ],
  },
  {
    id: "whatsappOptIn",
    type: "checkbox",
    label: "I agree to be added to the event's WhatsApp group",
    required: false,
  },
];

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  email: "Email",
  tel: "Phone",
  select: "Dropdown",
  checkbox: "Checkbox",
  textarea: "Textarea",
  radio: "Radio",
  number: "Number",
  guestGroup: "Guest Group",
};

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig>({
    title: "RSVP",
    fields: [...DEFAULT_FIELDS],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) fetchEvent();
  }, [eventId]);

  async function fetchEvent() {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();
      setEvent(data);
      if (data.formConfig) {
        try {
          const parsed = JSON.parse(data.formConfig);
          setFormConfig(parsed);
        } catch {
          // Use defaults
        }
      }
    } catch (err) {
      setToast({ message: "Failed to load event", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/events/${eventId}/design`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formConfig: JSON.stringify(formConfig) }),
      });

      if (response.ok) {
        setToast({ message: "Form configuration saved", type: "success" });
      } else {
        const data = await response.json().catch(() => ({}));
        setToast({ message: data.error || "Failed to save form configuration", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Failed to save form configuration", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function addField() {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: "text",
      label: "New Field",
      required: false,
    };
    setFormConfig((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setEditingField(newField.id);
  }

  function removeField(fieldId: string) {
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.filter((f) => f.id !== fieldId),
    }));
    if (editingField === fieldId) setEditingField(null);
  }

  function updateField(fieldId: string, updates: Partial<FormField>) {
    setFormConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
  }

  function moveField(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formConfig.fields.length) return;

    const newFields = [...formConfig.fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFormConfig((prev) => ({ ...prev, fields: newFields }));
  }

  function handleOptionsChange(fieldId: string, value: string) {
    const options = value.split(",").map((o) => o.trim()).filter(Boolean);
    updateField(fieldId, { options });
  }

  function handleConditionalChange(fieldId: string, value: string) {
    const conditional = value.split(",").map((c) => c.trim()).filter(Boolean);
    updateField(fieldId, { conditional: conditional.length > 0 ? conditional : undefined });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">RSVP Form Builder</h1>
          <p className="text-muted text-sm">
            {event ? event.title : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/events/${eventId}/design`}
            className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors text-sm"
          >
            Design Page
          </Link>
          <button
            onClick={() => router.push("/admin/events")}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* Form Title */}
      <div className="bg-white rounded-lg border border-line p-4">
        <label className="text-sm font-medium">Form Title</label>
        <input
          type="text"
          value={formConfig.title}
          onChange={(e) => setFormConfig((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full mt-1 px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Fields List */}
      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="px-4 py-3 border-b border-line flex items-center justify-between">
          <h2 className="text-lg font-medium">Fields ({formConfig.fields.length})</h2>
          <button
            onClick={addField}
            className="px-3 py-1.5 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors text-sm"
          >
            + Add Field
          </button>
        </div>

        <div className="divide-y divide-line">
          {formConfig.fields.map((field, index) => (
            <div key={field.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{field.label}</span>
                    <span className="text-xs text-muted bg-cream px-2 py-0.5 rounded">
                      {FIELD_TYPE_LABELS[field.type]}
                    </span>
                    {field.required && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                    {field.conditional && (
                      <span className="text-xs text-gold">Conditional</span>
                    )}
                  </div>
                  <p className="text-xs text-muted">ID: {field.id}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveField(index, "up")}
                    disabled={index === 0}
                    className="p-1.5 text-muted hover:text-ink disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveField(index, "down")}
                    disabled={index === formConfig.fields.length - 1}
                    className="p-1.5 text-muted hover:text-ink disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => setEditingField(editingField === field.id ? null : field.id)}
                    className="px-3 py-1.5 text-sm border border-line rounded hover:bg-cream transition-colors"
                  >
                    {editingField === field.id ? "Done" : "Edit"}
                  </button>
                  <button
                    onClick={() => removeField(field.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Edit Panel */}
              {editingField === field.id && (
                <div className="mt-4 p-4 bg-cream rounded-lg space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Field Type</label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                        className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                      >
                        {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value || undefined })}
                        className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-line text-gold focus:ring-gold"
                      />
                      <label className="text-sm">Required field</label>
                    </div>
                  </div>

                  {(field.type === "select") && (
                    <div>
                      <label className="text-sm font-medium">Options (comma-separated)</label>
                      <input
                        type="text"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) => handleOptionsChange(field.id, e.target.value)}
                        placeholder="Mr, Mrs, Ms, Dr"
                        className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Conditional Fields (comma-separated IDs)</label>
                    <p className="text-xs text-muted mb-1">
                      When this checkbox is checked, show these fields
                    </p>
                    <input
                      type="text"
                      value={field.conditional?.join(", ") || ""}
                      onChange={(e) => handleConditionalChange(field.id, e.target.value)}
                      placeholder="guestTitle, guestFullname"
                      className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  {field.type === "number" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Maximum value</label>
                        <input
                          type="number"
                          value={field.max ?? ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              max: e.target.value ? parseInt(e.target.value, 10) : undefined,
                            })
                          }
                          placeholder="5"
                          className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Max from query param</label>
                        <p className="text-xs text-muted mb-1">e.g. noi</p>
                        <input
                          type="text"
                          value={field.maxFromQuery || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              maxFromQuery: e.target.value || undefined,
                            })
                          }
                          placeholder="noi"
                          className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                    </div>
                  )}

                  {field.type === "guestGroup" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Count field</label>
                        <p className="text-xs text-muted mb-1">Number field that controls how many guests to render</p>
                        <select
                          value={field.countField || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              countField: e.target.value || undefined,
                            })
                          }
                          className="w-full mt-1 px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                        >
                          <option value="">Select a number field</option>
                          {formConfig.fields
                            .filter((f) => f.type === "number" && f.id !== field.id)
                            .map((f) => (
                              <option key={f.id} value={f.id}>{f.label} ({f.id})</option>
                            ))}
                        </select>
                      </div>

                      {field.subFields && field.subFields.length > 0 && (
                        <div>
                          <label className="text-sm font-medium">Guest fields</label>
                          <div className="mt-2 space-y-3">
                            {field.subFields.map((sub, idx) => (
                              <div key={sub.id} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end p-3 bg-white rounded-lg border border-line">
                                <div className="sm:col-span-2">
                                  <label className="text-xs text-muted">Label</label>
                                  <input
                                    type="text"
                                    value={sub.label}
                                    onChange={(e) => {
                                      const next = [...(field.subFields ?? [])];
                                      next[idx] = { ...sub, label: e.target.value };
                                      updateField(field.id, { subFields: next });
                                    }}
                                    className="w-full mt-1 px-2 py-1.5 border border-line rounded text-sm"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-xs text-muted">Type</label>
                                  <select
                                    value={sub.type}
                                    onChange={(e) => {
                                      const next = [...(field.subFields ?? [])];
                                      const newType = e.target.value as FieldType;
                                      next[idx] = { ...sub, type: newType };
                                      if (newType === "select" && !sub.options) {
                                        next[idx].options = ["Mr", "Mrs", "Ms", "Dr"];
                                      }
                                      updateField(field.id, { subFields: next });
                                    }}
                                    className="w-full mt-1 px-2 py-1.5 border border-line rounded text-sm bg-white"
                                  >
                                    {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="sm:col-span-2">
                                  <label className="text-xs text-muted">Placeholder</label>
                                  <input
                                    type="text"
                                    value={sub.placeholder || ""}
                                    onChange={(e) => {
                                      const next = [...(field.subFields ?? [])];
                                      next[idx] = {
                                        ...sub,
                                        placeholder: e.target.value || undefined,
                                      };
                                      updateField(field.id, { subFields: next });
                                    }}
                                    className="w-full mt-1 px-2 py-1.5 border border-line rounded text-sm"
                                  />
                                </div>
                                {sub.type === "select" && (
                                  <div className="sm:col-span-4">
                                    <label className="text-xs text-muted">Options (comma-separated)</label>
                                    <input
                                      type="text"
                                      value={sub.options?.join(", ") || ""}
                                      onChange={(e) => {
                                        const next = [...(field.subFields ?? [])];
                                        next[idx] = {
                                          ...sub,
                                          options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                                        };
                                        updateField(field.id, { subFields: next });
                                      }}
                                      placeholder="Mr, Mrs, Ms, Dr"
                                      className="w-full mt-1 px-2 py-1.5 border border-line rounded text-sm"
                                    />
                                  </div>
                                )}
                                <div className="flex items-center gap-2 sm:col-span-2">
                                  <input
                                    type="checkbox"
                                    checked={sub.required}
                                    onChange={(e) => {
                                      const next = [...(field.subFields ?? [])];
                                      next[idx] = { ...sub, required: e.target.checked };
                                      updateField(field.id, { subFields: next });
                                    }}
                                    className="w-4 h-4 rounded border-line"
                                  />
                                  <label className="text-sm">Required</label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {formConfig.fields.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            <p className="mb-4">No fields configured yet.</p>
            <button
              onClick={addField}
              className="px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors text-sm"
            >
              Add Your First Field
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Form Configuration"}
        </button>
        <button
          onClick={() => setFormConfig({ title: "RSVP", fields: [...DEFAULT_FIELDS] })}
          className="px-6 py-2 border border-line rounded-lg hover:bg-cream transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-line p-6">
        <h2 className="text-lg font-medium mb-4">Form Preview</h2>
        <div className="space-y-4 max-w-lg">
          <h3 className="font-serif text-xl font-semibold text-ink">{formConfig.title}</h3>
          {formConfig.fields.map((field) => {
            if (field.conditional) {
              return (
                <div key={field.id} className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-line" />
                    <span className="text-sm font-medium text-ink">{field.label}</span>
                  </label>
                  <div className="pl-7 space-y-3 border-l-2 border-line ml-2">
                    {field.conditional.map((condId) => {
                      const condField = formConfig.fields.find((f) => f.id === condId);
                      if (!condField) return null;
                      return (
                        <div key={condId} className="space-y-1">
                          <label className="text-xs font-medium text-ink">{condField.label}</label>
                          <input
                            type="text"
                            placeholder={condField.placeholder}
                            disabled
                            className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-cream/50"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div key={field.id} className="space-y-1">
                <label className="text-sm font-medium text-ink">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    disabled
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-cream/50"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    disabled
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-cream/50"
                    rows={3}
                  />
                ) : field.type === "checkbox" ? (
                  <label className="flex items-center gap-3">
                    <input type="checkbox" disabled className="w-4 h-4 rounded border-line" />
                    <span className="text-sm text-ink">{field.label}</span>
                  </label>
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    disabled
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-cream/50"
                  />
                ) : field.type === "guestGroup" ? (
                  <div className="space-y-2 p-3 border border-line rounded-lg bg-cream/50">
                    <p className="text-xs text-muted">{field.label} ({field.subFields?.length ?? 0} fields per guest)</p>
                  </div>
                ) : field.type === "radio" ? (
                  <div className="space-y-2">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input type="radio" disabled className="w-4 h-4" />
                        <span className="text-sm text-ink">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    disabled
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-line rounded-lg text-sm bg-cream/50"
                  />
                )}
              </div>
            );
          })}
          <button
            disabled
            className="w-full px-6 py-3 bg-burgundy text-white rounded-lg opacity-50 font-medium"
          >
            Register
          </button>
        </div>
      </div>

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
