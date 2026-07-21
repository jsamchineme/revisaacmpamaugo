"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FormField, FormConfig } from "@/lib/form-config-types";

interface Registration {
  id: string;
  eventId: string;
  title: string;
  fullname: string;
  phone: string;
  email: string | null;
  plusOne: boolean;
  plusOneGuests: string | null;
  whatsappOptIn: boolean;
  customData: string | null;
  createdAt: string;
}

interface EventInfo {
  id: string;
  title: string;
  slug: string;
  formConfig: string | null;
}

// All fields stored as named Prisma columns
const PRISMA_FIELDS = new Set(["title", "fullname", "phone", "email", "plusOne", "plusOneGuests", "whatsappOptIn"]);

function getFieldValue(reg: Registration, fieldId: string): unknown {
  if (fieldId in reg && PRISMA_FIELDS.has(fieldId)) {
    return (reg as unknown as Record<string, unknown>)[fieldId];
  }
  if (reg.customData) {
    try {
      const cd = JSON.parse(reg.customData);
      if (fieldId in cd) return cd[fieldId];
    } catch {}
  }
  return undefined;
}

function parseGuests(reg: Registration): Record<string, string>[] {
  // Guests stored as array in plusOneGuests (dynamic guest form)
  if (reg.plusOneGuests) {
    try {
      const arr = JSON.parse(reg.plusOneGuests);
      if (Array.isArray(arr)) return arr;
    } catch {}
  }
  // Guests stored as individual fields in customData (conditional field form)
  if (reg.customData) {
    try {
      const cd = JSON.parse(reg.customData);
      const guestKeys = Object.keys(cd).filter((k) => k.startsWith("guest"));
      if (guestKeys.length > 0) return [cd];
    } catch {}
  }
  return [];
}

function getGuestGroupFields(formConfig: FormConfig | null): FormField[] {
  return (formConfig?.fields ?? []).filter((f) => f.type === "guestGroup");
}

export default function RegistrationsPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventInfo | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappOnly, setWhatsappOnly] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [evResp, regResp] = await Promise.all([
          fetch(`/api/admin/events/${eventId}`),
          fetch(`/api/admin/events/${eventId}/registrations?whatsappOnly=${whatsappOnly}`),
        ]);
        if (!evResp.ok) throw new Error("Failed to fetch event");
        if (!regResp.ok) throw new Error("Failed to fetch registrations");

        const evData: EventInfo = await evResp.json();
        const regData: Registration[] = await regResp.json();

        setEvent(evData);
        setRegistrations(regData);

        if (evData.formConfig) {
          try { setFormConfig(JSON.parse(evData.formConfig)); } catch {}
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    if (eventId) load();
  }, [eventId, whatsappOnly]);

  // Build column list from formConfig (or fall back to defaults)
  const conditionalIds = new Set(
    (formConfig?.fields ?? [])
      .filter((f) => f.type === "checkbox" && f.conditional?.length)
      .flatMap((f) => f.conditional ?? [])
  );

  // Checkbox fields whose conditionals contain a guestGroup — hide these since the
  // guestGroup column already shows the same info (count + expandable details)
  const checkboxIdsWithGuestGroup = new Set(
    (formConfig?.fields ?? [])
      .filter(
        (f) =>
          f.type === "checkbox" &&
          f.conditional?.some((cid) =>
            formConfig?.fields.find((ff) => ff.id === cid && ff.type === "guestGroup")
          )
      )
      .map((f) => f.id)
  );

  const columns: FormField[] = formConfig
    ? formConfig.fields.filter(
        (f) =>
          (!conditionalIds.has(f.id) || f.type === "guestGroup") &&
          !checkboxIdsWithGuestGroup.has(f.id)
      )
    : [
        { id: "title", type: "text", label: "Title", required: false },
        { id: "fullname", type: "text", label: "Full Name", required: false },
        { id: "phone", type: "tel", label: "Phone", required: false },
        { id: "email", type: "email", label: "Email", required: false },
        { id: "plusOne", type: "checkbox", label: "Guest", required: false },
        { id: "whatsappOptIn", type: "checkbox", label: "WhatsApp", required: false },
      ];

  // Conditional field labels keyed by checkboxId
  const conditionalsByCheckbox = new Map<string, FormField[]>();
  if (formConfig) {
    for (const f of formConfig.fields) {
      if (f.type === "checkbox" && f.conditional?.length) {
        const condFields = f.conditional
          .map((cid) => formConfig.fields.find((ff) => ff.id === cid))
          .filter((ff): ff is FormField => !!ff);
        conditionalsByCheckbox.set(f.id, condFields);
      }
    }
  }

  function getTotalCount(): number {
    let count = registrations.length;
    for (const reg of registrations) {
      count += parseGuests(reg).length > 0 && reg.plusOne ? parseGuests(reg).length : 0;
    }
    return count;
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  }

  async function deleteRegistration(regId: string) {
    setDeleting(regId);
    setConfirmDelete(null);
    try {
      const resp = await fetch(`/api/admin/events/${eventId}/registrations/${regId}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Failed to delete");
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    } catch {
      setError("Failed to delete registration.");
    } finally {
      setDeleting(null);
    }
  }

  function renderCell(reg: Registration, field: FormField) {
    const val = getFieldValue(reg, field.id);

    if (field.type === "checkbox") {
      const isChecked = Boolean(val);
      const condFields = conditionalsByCheckbox.get(field.id);

      if (!isChecked) return <span className="text-muted text-sm">–</span>;

      if (condFields?.length) {
        const guests = parseGuests(reg);
        const guestCount = guests.length;
        const isOpen = expanded.has(reg.id + field.id);
        return (
          <button
            onClick={() =>
              setExpanded((prev) => {
                const next = new Set(prev);
                const key = reg.id + field.id;
                next.has(key) ? next.delete(key) : next.add(key);
                return next;
              })
            }
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            Yes{guestCount > 0 ? ` (${guestCount})` : ""}
            <span className="ml-0.5">{isOpen ? "▴" : "▾"}</span>
          </button>
        );
      }

      return (
        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          Yes
        </span>
      );
    }

    if (field.type === "guestGroup") {
      const guests = parseGuests(reg);
      if (guests.length === 0) return <span className="text-muted text-sm">–</span>;
      const isOpen = expanded.has(reg.id + field.id);
      return (
        <button
          onClick={() =>
            setExpanded((prev) => {
              const next = new Set(prev);
              const key = reg.id + field.id;
              next.has(key) ? next.delete(key) : next.add(key);
              return next;
            })
          }
          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
        >
          {guests.length} Guest{guests.length !== 1 ? "s" : ""}
          <span className="ml-0.5">{isOpen ? "▴" : "▾"}</span>
        </button>
      );
    }

    if (field.id === "whatsappOptIn") {
      return val ? (
        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Opted In</span>
      ) : (
        <span className="text-muted text-sm">–</span>
      );
    }

    const str = val == null || val === "" ? "–" : String(val);
    return <span className="text-sm">{str}</span>;
  }

  function renderGuestRow(reg: Registration, field: FormField, colSpan: number) {
    const condFields = conditionalsByCheckbox.get(field.id);
    if (!condFields?.length) return null;
    const guests = parseGuests(reg);
    if (!guests.length) return null;
    const isOpen = expanded.has(reg.id + field.id);
    if (!isOpen) return null;

    const guestGroup = condFields.find((cf) => cf.type === "guestGroup");
    const subFields = guestGroup?.subFields ?? [];

    return guests.map((guest, gi) => (
      <tr key={`${reg.id}-guest-${gi}`} className="bg-blue-50 border-t border-blue-100">
        <td colSpan={colSpan} className="px-4 py-2">
          <div className="flex flex-wrap gap-4 text-xs text-blue-900">
            <span className="font-medium text-blue-700 mr-1">↳ Guest {guests.length > 1 ? gi + 1 : ""}:</span>
            <span>
              <span className="text-blue-500 font-medium">Main contact phone: </span>
              {reg.phone}
            </span>
            {subFields.length > 0
              ? subFields.map((sf) => {
                  const v = guest[sf.id];
                  if (v == null || v === "") return null;
                  return (
                    <span key={sf.id}>
                      <span className="text-blue-500 font-medium">{sf.label}: </span>
                      {String(v)}
                    </span>
                  );
                })
              : condFields.map((cf) => {
                  const v = guest[cf.id] ?? guest[cf.id.replace(/^guest/, "").toLowerCase()];
                  if (!v) return null;
                  return (
                    <span key={cf.id}>
                      <span className="text-blue-500 font-medium">{cf.label}: </span>
                      {String(v)}
                    </span>
                  );
                })}
          </div>
        </td>
      </tr>
    ));
  }

  function renderGuestGroupRow(reg: Registration, field: FormField, colSpan: number) {
    if (field.type !== "guestGroup") return null;
    const guests = parseGuests(reg);
    if (!guests.length) return null;
    const isOpen = expanded.has(reg.id + field.id);
    if (!isOpen) return null;

    const subFields = field.subFields ?? [];

    return guests.map((guest, gi) => (
      <tr key={`${reg.id}-gg-${field.id}-${gi}`} className="bg-blue-50 border-t border-blue-100">
        <td colSpan={colSpan} className="px-4 py-2">
          <div className="flex flex-wrap gap-4 text-xs text-blue-900">
            <span className="font-medium text-blue-700 mr-1">↳ Guest {guests.length > 1 ? gi + 1 : ""}:</span>
            {subFields.length === 0 ? (
              Object.entries(guest).map(([k, v]) => (
                <span key={k}>
                  <span className="text-blue-500 font-medium capitalize">{k}: </span>
                  {String(v)}
                </span>
              ))
            ) : (
              subFields.map((sf) => {
                const v = guest[sf.id];
                if (v == null || v === "") return null;
                return (
                  <span key={sf.id}>
                    <span className="text-blue-500 font-medium">{sf.label}: </span>
                    {String(v)}
                  </span>
                );
              })
            )}
          </div>
        </td>
      </tr>
    ));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg animate-pulse text-muted">Loading registrations...</div>
      </div>
    );
  }

  const colSpan = columns.length + 2; // +1 Registered At, +1 delete

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Registrations</h1>
        {event && (
          <p className="text-sm text-muted mt-1">
            {event.title} · {getTotalCount()} attendee{getTotalCount() !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-sm underline flex-shrink-0">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {(["All", "WhatsApp Group Only"] as const).map((label) => {
            const active = label === "All" ? !whatsappOnly : whatsappOnly;
            return (
              <button
                key={label}
                onClick={() => setWhatsappOnly(label !== "All")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? label === "All" ? "bg-burgundy text-white" : "bg-green-600 text-white"
                    : "bg-cream text-muted hover:bg-cream/80 border border-line"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            const url = `/api/admin/events/${eventId}/registrations/export?whatsappOnly=${whatsappOnly}`;
            window.location.href = url;
          }}
          disabled={registrations.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            registrations.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-burgundy text-white hover:bg-burgundy-dark"
          }`}
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-cream">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    title={col.label}
                    className="px-4 py-3 text-left text-sm font-medium text-muted max-w-[10rem] truncate"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-muted whitespace-nowrap">
                  Registered At
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {registrations.map((reg) => (
                <>
                  <tr key={reg.id} className="hover:bg-cream/50">
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-3">
                        {renderCell(reg, col)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm whitespace-nowrap text-muted">
                      {formatDate(reg.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {confirmDelete === reg.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteRegistration(reg.id)}
                            disabled={deleting === reg.id}
                            className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {deleting === reg.id ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs px-2 py-1 rounded border border-line hover:bg-cream transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(reg.id)}
                          className="text-muted hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete registration"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                  {columns
                    .filter((col) => col.type === "checkbox" && conditionalsByCheckbox.has(col.id))
                    .map((col) => renderGuestRow(reg, col, colSpan))}
                  {columns
                    .filter((col) => col.type === "guestGroup")
                    .map((col) => renderGuestGroupRow(reg, col, colSpan))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {registrations.length === 0 && (
          <div className="px-4 py-12 text-center text-muted">
            <p className="text-lg font-medium mb-1">No registrations yet</p>
            <p className="text-sm">Registrations will appear here once people RSVP for this event.</p>
          </div>
        )}
      </div>

      <Link
        href="/admin/events"
        className="inline-block px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
      >
        ← Back to Events
      </Link>
    </div>
  );
}
