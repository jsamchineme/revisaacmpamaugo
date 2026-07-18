"use client";

import { useState } from "react";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  conditional?: string[];
}

interface FormConfig {
  title: string;
  fields: FormField[];
}

interface DynamicRSVPFormProps {
  eventSlug: string;
  formConfig: FormConfig;
  onSuccess: () => void;
}

const E164_REGEX = /^\+[1-9][0-9]{7,14}$/;
const MAX_GUESTS = 5;

interface Guest {
  title: string;
  fullname: string;
  phone: string;
  email: string;
}

const emptyGuest: Guest = {
  title: "Mr",
  fullname: "",
  phone: "",
  email: "",
};

export default function DynamicRSVPForm({ eventSlug, formConfig, onSuccess }: DynamicRSVPFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [conditionalVisible, setConditionalVisible] = useState<Record<string, boolean>>({});
  const [guests, setGuests] = useState<Guest[]>([{ ...emptyGuest }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const checkboxFields = formConfig.fields.filter((f) => f.type === "checkbox" && f.conditional);
  const regularFields = formConfig.fields.filter((f) => !f.conditional || f.type !== "checkbox");

  function getConditionalParent(fieldId: string): FormField | undefined {
    return checkboxFields.find((f) => f.conditional?.includes(fieldId));
  }

  function isFieldVisible(field: FormField): boolean {
    const parent = getConditionalParent(field.id);
    if (!parent) return true;
    return !!conditionalVisible[parent.id];
  }

  function updateField(fieldId: string, value: any) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });

    // Check if this is a checkbox with conditional fields
    const field = formConfig.fields.find((f) => f.id === fieldId);
    if (field?.type === "checkbox" && field.conditional) {
      setConditionalVisible((prev) => ({ ...prev, [fieldId]: value }));
    }
  }

  function addGuest() {
    if (guests.length >= MAX_GUESTS) return;
    setGuests((prev) => [...prev, { ...emptyGuest }]);
  }

  function removeGuest(index: number) {
    setGuests((prev) => prev.filter((_, i) => i !== index));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`guest-${index}-fullname`];
      delete next[`guest-${index}-phone`];
      return next;
    });
  }

  function updateGuest(index: number, field: keyof Guest, value: string) {
    setGuests((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`guest-${index}-${field}`];
      return next;
    });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    for (const field of formConfig.fields) {
      if (!isFieldVisible(field)) continue;
      if (field.conditional && getConditionalParent(field.id)) continue; // Skip conditional fields, handled separately

      const value = formData[field.id];
      if (field.required && (!value || (typeof value === "string" && value.trim() === ""))) {
        errors[field.id] = `${field.label} is required`;
      }

      if (field.type === "tel" && value && !E164_REGEX.test(value.trim())) {
        errors[field.id] = "Phone must be in E.164 format (e.g., +2348012345678)";
      }

      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        errors[field.id] = "Please enter a valid email address";
      }
    }

    // Validate guests if plus-one is checked
    const plusOneField = checkboxFields.find((f) => f.id === "plusOne");
    if (plusOneField && conditionalVisible[plusOneField.id]) {
      guests.forEach((guest, i) => {
        if (!guest.fullname.trim()) {
          errors[`guest-${i}-fullname`] = "Guest name is required";
        }
        if (!guest.phone.trim()) {
          errors[`guest-${i}-phone`] = "Guest phone is required";
        } else if (!E164_REGEX.test(guest.phone.trim())) {
          errors[`guest-${i}-phone`] = "Phone must be in E.164 format";
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const payload: Record<string, any> = {};

      // Build payload from form data
      for (const field of formConfig.fields) {
        if (!isFieldVisible(field)) continue;
        const value = formData[field.id];
        if (field.type === "checkbox") {
          payload[field.id] = !!value;
        } else {
          payload[field.id] = value?.trim() || null;
        }
      }

      // Handle plus-one guests
      if (conditionalVisible["plusOne"]) {
        payload.plusOne = true;
        payload.plusOneGuests = guests.map((g) => ({
          title: g.title,
          fullname: g.fullname.trim(),
          phone: g.phone.trim(),
          email: g.email.trim() || undefined,
        }));
      } else {
        payload.plusOne = false;
        payload.plusOneGuests = [];
      }

      const res = await fetch(`/events/${eventSlug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function renderField(field: FormField) {
    if (!isFieldVisible(field)) return null;

    const hasError = !!fieldErrors[field.id];
    const value = formData[field.id] || "";

    switch (field.type) {
      case "select":
        return (
          <select
            id={field.id}
            name={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-white ${
              hasError ? "border-red-400 bg-red-50" : "border-line"
            }`}
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              checked={!!value}
              onChange={(e) => updateField(field.id, e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-line text-gold focus:ring-gold"
            />
            <span className="text-sm text-ink">{field.label}</span>
          </label>
        );

      case "textarea":
        return (
          <textarea
            id={field.id}
            name={field.id}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
              hasError ? "border-red-400 bg-red-50" : "border-line"
            }`}
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  id={`${field.id}-${opt}`}
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  className="w-4 h-4 text-gold border-line focus:ring-gold"
                />
                <span className="text-sm text-ink">{opt}</span>
              </label>
            ))}
          </div>
        );

      case "number":
        return (
          <input
            id={field.id}
            name={field.id}
            type="number"
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={0}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
              hasError ? "border-red-400 bg-red-50" : "border-line"
            }`}
          />
        );

      default:
        return (
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            value={value}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
              hasError ? "border-red-400 bg-red-50" : "border-line"
            }`}
          />
        );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <h2 className="font-serif text-xl font-semibold text-ink">{formConfig.title}</h2>

      {regularFields.map((field) => (
        <div key={field.id} className="space-y-2">
          {field.type !== "checkbox" && (
            <label htmlFor={field.id} className="text-sm font-medium text-ink">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderField(field)}
          {fieldErrors[field.id] && (
            <p className="text-sm text-red-500">{fieldErrors[field.id]}</p>
          )}

          {/* Conditional fields */}
          {field.type === "checkbox" && field.conditional && conditionalVisible[field.id] && (
            <div className="space-y-4 pl-7 mt-4">
              {/* Guest forms for plus-one */}
              {field.id === "plusOne" ? (
                <>
                  {guests.map((guest, i) => (
                    <div
                      key={i}
                      className="border border-line rounded-lg p-4 bg-cream/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-ink">Guest {i + 1}</h4>
                        {guests.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGuest(i)}
                            className="text-xs text-red-600 hover:text-red-800 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-ink">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={guest.title}
                            onChange={(e) => updateGuest(i, "title", e.target.value)}
                            className="w-full px-3 py-1.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold bg-white"
                          >
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Ms">Ms</option>
                            <option value="Dr">Dr</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-ink">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={guest.fullname}
                            onChange={(e) => updateGuest(i, "fullname", e.target.value)}
                            placeholder="Jane Doe"
                            className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold ${
                              fieldErrors[`guest-${i}-fullname`]
                                ? "border-red-400 bg-red-50"
                                : "border-line"
                            }`}
                          />
                          {fieldErrors[`guest-${i}-fullname`] && (
                            <p className="text-xs text-red-500">{fieldErrors[`guest-${i}-fullname`]}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-ink">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={guest.phone}
                            onChange={(e) => updateGuest(i, "phone", e.target.value)}
                            placeholder="+2348098765432"
                            className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold ${
                              fieldErrors[`guest-${i}-phone`]
                                ? "border-red-400 bg-red-50"
                                : "border-line"
                            }`}
                          />
                          {fieldErrors[`guest-${i}-phone`] && (
                            <p className="text-xs text-red-500">{fieldErrors[`guest-${i}-phone`]}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-ink">Email</label>
                          <input
                            type="email"
                            value={guest.email}
                            onChange={(e) => updateGuest(i, "email", e.target.value)}
                            placeholder="jane@example.com"
                            className="w-full px-3 py-1.5 border border-line rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {guests.length < MAX_GUESTS && (
                    <button
                      type="button"
                      onClick={addGuest}
                      className="text-sm text-gold hover:text-gold-dark transition-colors font-medium"
                    >
                      + Add Guest
                    </button>
                  )}

                  {guests.length >= MAX_GUESTS && (
                    <p className="text-xs text-muted">Maximum {MAX_GUESTS} guests</p>
                  )}
                </>
              ) : (
                // Other conditional fields
                field.conditional.map((condId) => {
                  const condField = formConfig.fields.find((f) => f.id === condId);
                  if (!condField) return null;
                  return (
                    <div key={condId} className="space-y-2">
                      <label htmlFor={condField.id} className="text-sm font-medium text-ink">
                        {condField.label}
                        {condField.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderField(condField)}
                      {fieldErrors[condField.id] && (
                        <p className="text-sm text-red-500">{fieldErrors[condField.id]}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-burgundy text-white rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50 font-medium"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
