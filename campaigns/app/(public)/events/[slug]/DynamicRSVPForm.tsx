"use client";

import { useState } from "react";
import { FormField, FormConfig, FieldType } from "@/lib/form-config-types";
import PhoneInput from "@/components/PhoneInput";

interface DynamicRSVPFormProps {
  eventSlug: string;
  formConfig: FormConfig;
  onSuccess: () => void;
  queryMaxGuests?: number;
}

const E164_REGEX = /^\+[1-9][0-9]{7,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GUEST_FIELD_ID = "guests";
const PLUS_ONE_FIELD_ID = "plusOne";

interface GuestValues {
  [fieldId: string]: string;
}

const GUEST_SUB_FIELD_DEFAULTS: Record<string, string> = {
  title: "Mr",
};

function buildEmptyGuest(subFields: FormField[]): GuestValues {
  const values: GuestValues = {};
  for (const sub of subFields) {
    values[sub.id] = GUEST_SUB_FIELD_DEFAULTS[sub.id] || "";
  }
  return values;
}

function buildInitialGuests(count: number, subFields: FormField[]): GuestValues[] {
  const safe = Math.max(0, Math.min(count, 5));
  return Array.from({ length: safe }, () => buildEmptyGuest(subFields));
}

function getNumberMax(field: FormField, queryMaxGuests: number): number | undefined {
  const absoluteMax = field.max ?? 5;
  if (field.maxFromQuery && queryMaxGuests > 0) {
    return Math.min(queryMaxGuests - 1, absoluteMax);
  }
  return absoluteMax;
}

export default function DynamicRSVPForm({
  eventSlug,
  formConfig,
  onSuccess,
  queryMaxGuests = 0,
}: DynamicRSVPFormProps) {
  const checkboxFields = formConfig.fields.filter((f) => f.type === "checkbox" && f.conditional);
  const regularFields = formConfig.fields.filter((f) => !f.conditional || f.type !== "checkbox");
  const guestGroupFields = formConfig.fields.filter((f) => f.type === "guestGroup");

  const [formData, setFormData] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    const visible: Record<string, boolean> = {};

    for (const field of formConfig.fields) {
      if (field.type === "number" && field.maxFromQuery) {
        const max = getNumberMax(field, queryMaxGuests);
        if (max !== undefined && max > 0) {
          initial[field.id] = max;
          const parent = checkboxFields.find((f) => f.conditional?.includes(field.id));
          if (parent) {
            visible[parent.id] = true;
            initial[parent.id] = true;
          }
        }
      }
    }

    return initial;
  });

  const [conditionalVisible, setConditionalVisible] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const field of checkboxFields) {
      if (formData[field.id] === true) {
        initial[field.id] = true;
      }
    }
    return initial;
  });

  const [guestGroups, setGuestGroups] = useState<Record<string, GuestValues[]>>(() => {
    const initial: Record<string, GuestValues[]> = {};
    for (const group of guestGroupFields) {
      const countField = group.countField ? formConfig.fields.find((f) => f.id === group.countField) : undefined;
      const parent = countField ? checkboxFields.find((f) => f.conditional?.includes(countField.id)) : undefined;
      const parentVisible = !parent || conditionalVisible[parent.id];
      if (!parentVisible) {
        initial[group.id] = [];
        continue;
      }
      if (countField?.type === "number" && !isNumberInputVisible(countField)) {
        initial[group.id] = buildInitialGuests(1, group.subFields || []);
        continue;
      }
      const count = countField?.type === "number" ? Number(formData[countField.id] || 0) : 0;
      if (count > 0) {
        initial[group.id] = buildInitialGuests(count, group.subFields || []);
      } else {
        initial[group.id] = [];
      }
    }
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function getConditionalParent(fieldId: string): FormField | undefined {
    return checkboxFields.find((f) => f.conditional?.includes(fieldId));
  }

  function isNumberInputVisible(field: FormField): boolean {
    if (field.type !== "number" || !field.maxFromQuery) return true;
    return queryMaxGuests > 1;
  }

  function isGuestControllingCheckbox(field: FormField): boolean {
    if (field.type !== "checkbox" || !field.conditional?.length) return false;
    return field.conditional.some((condId) => {
      const condField = formConfig.fields.find((f) => f.id === condId);
      return condField?.type === "number" && condField.maxFromQuery;
    });
  }

  function isFieldVisible(field: FormField): boolean {
    if (isGuestControllingCheckbox(field) && queryMaxGuests <= 1) return false;
    const parent = getConditionalParent(field.id);
    if (parent && !conditionalVisible[parent.id]) return false;
    return isNumberInputVisible(field);
  }

  function resizeGuestGroup(group: FormField, count: number) {
    const safeCount = Math.max(0, Math.min(count, group.max || 5));
    setGuestGroups((prev) => {
      const current = prev[group.id] || [];
      if (safeCount === current.length) return prev;
      if (safeCount < current.length) {
        return { ...prev, [group.id]: current.slice(0, safeCount) };
      }
      const added: GuestValues[] = [];
      for (let i = current.length; i < safeCount; i++) {
        added.push(buildEmptyGuest(group.subFields || []));
      }
      return { ...prev, [group.id]: [...current, ...added] };
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.startsWith(`${group.id}-`)) delete next[key];
      }
      return next;
    });
  }

  function updateField(fieldId: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });

    const field = formConfig.fields.find((f) => f.id === fieldId);
    if (field?.type === "checkbox" && field.conditional) {
      const checked = !!value;
      setConditionalVisible((prev) => ({ ...prev, [fieldId]: checked }));
      if (checked) {
        for (const condId of field.conditional) {
          const condField = formConfig.fields.find((f) => f.id === condId);
          if (condField?.type === "number") {
            if (!isNumberInputVisible(condField)) {
              for (const group of guestGroupFields) {
                if (group.countField === condId) {
                  resizeGuestGroup(group, 1);
                }
              }
              continue;
            }
            const current = Number(formData[condId]) || 0;
            if (current === 0) {
              const max = getNumberMax(condField, queryMaxGuests);
              const defaultValue = Math.min(1, max ?? 1);
              setFormData((prev) => ({ ...prev, [condId]: defaultValue }));
              for (const group of guestGroupFields) {
                if (group.countField === condId) {
                  resizeGuestGroup(group, defaultValue);
                }
              }
            }
          }
        }
      }
    }

    if (field?.type === "number") {
      for (const group of guestGroupFields) {
        if (group.countField === fieldId) {
          resizeGuestGroup(group, Number(value) || 0);
        }
      }
    }
  }

  function updateGuest(groupId: string, index: number, subFieldId: string, value: string) {
    setGuestGroups((prev) => {
      const current = prev[groupId] || [];
      const next = [...current];
      next[index] = { ...next[index], [subFieldId]: value };
      return { ...prev, [groupId]: next };
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`${groupId}-${index}-${subFieldId}`];
      return next;
    });
  }

  function validateGuestSubField(
    subField: FormField,
    value: string
  ): string | undefined {
    const trimmed = value.trim();
    if (subField.required && trimmed === "") {
      return `${subField.label} is required`;
    }
    if (subField.type === "tel" && trimmed && !E164_REGEX.test(trimmed)) {
      return "Please enter a valid phone number";
    }
    if (subField.type === "email" && trimmed && !EMAIL_REGEX.test(trimmed)) {
      return "Please enter a valid email address";
    }
    return undefined;
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    for (const field of formConfig.fields) {
      if (!isFieldVisible(field)) continue;
      if (field.type === "guestGroup") continue;

      const value = formData[field.id];
      if (field.required && (value === undefined || value === null || (typeof value === "string" && value.trim() === ""))) {
        errors[field.id] = `${field.label} is required`;
      }

      if (field.type === "tel" && typeof value === "string" && value.trim() && !E164_REGEX.test(value.trim())) {
        errors[field.id] = "Please enter a valid phone number";
      }

      if (field.type === "email" && typeof value === "string" && value.trim() && !EMAIL_REGEX.test(value.trim())) {
        errors[field.id] = "Please enter a valid email address";
      }
    }

    for (const group of guestGroupFields) {
      if (!isFieldVisible(group)) continue;
      const guests = guestGroups[group.id] || [];
      guests.forEach((guest, i) => {
        for (const subField of group.subFields || []) {
          const error = validateGuestSubField(subField, guest[subField.id] || "");
          if (error) {
            errors[`${group.id}-${i}-${subField.id}`] = error;
          }
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
      const payload: Record<string, unknown> = {};

      for (const field of formConfig.fields) {
        if (!isFieldVisible(field)) continue;
        if (field.type === "guestGroup") continue;

        const value = formData[field.id];
        if (field.type === "checkbox") {
          payload[field.id] = !!value;
        } else if (field.type === "number") {
          payload[field.id] = value === undefined ? null : Number(value);
        } else {
          payload[field.id] = typeof value === "string" ? value.trim() || null : value ?? null;
        }
      }

      const plusOneField = formConfig.fields.find((f) => f.id === PLUS_ONE_FIELD_ID && f.type === "checkbox");
      if (plusOneField) {
        payload.plusOne = !!formData[PLUS_ONE_FIELD_ID];
      }

      const guestGroup = guestGroupFields.find((f) => f.id === GUEST_FIELD_ID);
      if (guestGroup && isFieldVisible(guestGroup)) {
        payload.plusOneGuests = (guestGroups[GUEST_FIELD_ID] || []).map((guest) => {
          const guestPayload: Record<string, unknown> = {};
          for (const subField of guestGroup.subFields || []) {
            const value = guest[subField.id];
            if (subField.type === "select") {
              guestPayload[subField.id] = value || null;
            } else {
              guestPayload[subField.id] = value?.trim() || null;
            }
          }
          return guestPayload;
        });
      } else {
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

  function renderSubField(
    subField: FormField,
    groupId: string,
    index: number,
    value: string
  ) {
    const errorKey = `${groupId}-${index}-${subField.id}`;
    const hasError = !!fieldErrors[errorKey];
    const baseClass = `w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold ${
      hasError ? "border-red-400 bg-red-50" : "border-line"
    }`;

    const input = (() => {
      switch (subField.type) {
        case "tel":
          return (
            <PhoneInput
              value={value}
              onChange={(v) => updateGuest(groupId, index, subField.id, v)}
              placeholder={subField.placeholder}
              hasError={hasError}
            />
          );
        case "select":
          return (
            <select
              value={value}
              onChange={(e) => updateGuest(groupId, index, subField.id, e.target.value)}
              className={`${baseClass} bg-white`}
            >
              {subField.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          );
        case "textarea":
          return (
            <textarea
              value={value}
              onChange={(e) => updateGuest(groupId, index, subField.id, e.target.value)}
              placeholder={subField.placeholder}
              rows={2}
              className={baseClass}
            />
          );
        default:
          return (
            <input
              type={subField.type}
              value={value}
              onChange={(e) => updateGuest(groupId, index, subField.id, e.target.value)}
              placeholder={subField.placeholder}
              className={baseClass}
            />
          );
      }
    })();

    return (
      <div key={subField.id} className="space-y-1">
        <label className="text-xs font-medium text-ink">
          {subField.label}
          {subField.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {input}
        {fieldErrors[errorKey] && (
          <p className="text-xs text-red-500">{fieldErrors[errorKey]}</p>
        )}
      </div>
    );
  }

  function renderField(field: FormField) {
    if (!isFieldVisible(field)) return null;

    const hasError = !!fieldErrors[field.id];
    const value = formData[field.id] ?? "";
    const baseClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
      hasError ? "border-red-400 bg-red-50" : "border-line"
    }`;

    switch (field.type) {
      case "select":
        return (
          <select
            id={field.id}
            name={field.id}
            value={String(value)}
            onChange={(e) => updateField(field.id, e.target.value)}
            className={`${baseClass} bg-white`}
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
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
            value={String(value)}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={baseClass}
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

      case "number": {
        const max = getNumberMax(field, queryMaxGuests);
        return (
          <input
            id={field.id}
            name={field.id}
            type="number"
            value={String(value)}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={0}
            max={max}
            className={baseClass}
          />
        );
      }

      case "guestGroup": {
        const guests = guestGroups[field.id] || [];
        return (
          <div className="space-y-4">
            {guests.length === 0 && (
              <p className="text-sm text-muted">Set the number of guests above to add guest details.</p>
            )}
            {guests.map((guest, i) => (
              <div key={i} className="border border-line rounded-lg p-4 bg-cream/50 space-y-3">
                <h4 className="text-sm font-medium text-ink">Guest {i + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(field.subFields || []).map((sub) => renderSubField(sub, field.id, i, guest[sub.id] || ""))}
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "tel":
        return (
          <PhoneInput
            id={field.id}
            value={String(value)}
            onChange={(v) => updateField(field.id, v)}
            placeholder={field.placeholder}
            hasError={hasError}
          />
        );

      default:
        return (
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            value={String(value)}
            onChange={(e) => updateField(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseClass}
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

          {field.type === "checkbox" && field.conditional && conditionalVisible[field.id] && (
            <div className="space-y-4 pl-7 mt-4">
              {field.conditional.map((condId) => {
                const condField = formConfig.fields.find((f) => f.id === condId);
                if (!condField) return null;
                return (
                  <div key={condId} className="space-y-2">
                    {condField.type !== "checkbox" && (
                      <label htmlFor={condField.id} className="text-sm font-medium text-ink">
                        {condField.label}
                        {condField.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    )}
                    {renderField(condField)}
                    {fieldErrors[condField.id] && (
                      <p className="text-sm text-red-500">{fieldErrors[condField.id]}</p>
                    )}
                  </div>
                );
              })}
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
