"use client";

import { useState } from "react";

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

const E164_REGEX = /^\+[1-9][0-9]{7,14}$/;
const MAX_GUESTS = 5;

interface RSVPFormProps {
  eventSlug: string;
  onSuccess: () => void;
}

export default function RSVPForm({ eventSlug, onSuccess }: RSVPFormProps) {
  const [title, setTitle] = useState("Mr");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plusOne, setPlusOne] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([{ ...emptyGuest }]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function addGuest() {
    if (guests.length >= MAX_GUESTS) return;
    setGuests((prev) => [...prev, { ...emptyGuest }]);
  }

  function removeGuest(index: number) {
    setGuests((prev) => prev.filter((_, i) => i !== index));
    // Clear any errors for removed guest fields
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`guest-${index}-fullname`];
      delete next[`guest-${index}-phone`];
      delete next[`guest-${index}-email`];
      return next;
    });
  }

  function updateGuest(index: number, field: keyof Guest, value: string) {
    setGuests((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    );
    // Clear error for the updated field
    const errorKey = `guest-${index}-${field}`;
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[errorKey];
      return next;
    });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!fullname.trim()) {
      errors.fullname = "Full name is required";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!E164_REGEX.test(phone.trim())) {
      errors.phone = "Phone must be in E.164 format (e.g., +2348012345678)";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (plusOne) {
      guests.forEach((guest, i) => {
        if (!guest.fullname.trim()) {
          errors[`guest-${i}-fullname`] = "Guest name is required";
        }
        if (!guest.phone.trim()) {
          errors[`guest-${i}-phone`] = "Guest phone is required";
        } else if (!E164_REGEX.test(guest.phone.trim())) {
          errors[`guest-${i}-phone`] = "Phone must be in E.164 format (e.g., +2348012345678)";
        }
        if (guest.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
          errors[`guest-${i}-email`] = "Please enter a valid email address";
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
      const payload = {
        title,
        fullname: fullname.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        plusOne,
        plusOneGuests: plusOne
          ? guests.map((g) => ({
              title: g.title,
              fullname: g.fullname.trim(),
              phone: g.phone.trim(),
              email: g.email.trim() || undefined,
            }))
          : [],
        whatsappOptIn,
      };

      const res = await fetch(`/events/${eventSlug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        onSuccess();
      } else {
        setError(
          data.error || data.details?.fieldErrors
            ? Object.values(data.details.fieldErrors)
                .flat()
                .join(", ")
            : "Registration failed. Please try again."
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-ink">
          Title <span className="text-red-500">*</span>
        </label>
        <select
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-gold bg-white"
        >
          <option value="Mr">Mr</option>
          <option value="Mrs">Mrs</option>
          <option value="Ms">Ms</option>
          <option value="Dr">Dr</option>
        </select>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="fullname" className="text-sm font-medium text-ink">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="fullname"
          type="text"
          name="fullname"
          value={fullname}
          onChange={(e) => {
            setFullname(e.target.value);
            if (fieldErrors.fullname) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.fullname;
                return next;
              });
            }
          }}
          placeholder="John Doe"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
            fieldErrors.fullname ? "border-red-400 bg-red-50" : "border-line"
          }`}
        />
        {fieldErrors.fullname && (
          <p className="text-sm text-red-500">{fieldErrors.fullname}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium text-ink">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (fieldErrors.phone) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.phone;
                return next;
              });
            }
          }}
          placeholder="+2348012345678"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
            fieldErrors.phone ? "border-red-400 bg-red-50" : "border-line"
          }`}
        />
        <p className="text-xs text-muted">
          Enter phone in international format (e.g., +2348012345678)
        </p>
        {fieldErrors.phone && (
          <p className="text-sm text-red-500">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.email;
                return next;
              });
            }
          }}
          placeholder="john@example.com"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold ${
            fieldErrors.email ? "border-red-400 bg-red-50" : "border-line"
          }`}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      {/* Plus-one checkbox */}
      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={plusOne}
            onChange={(e) => {
              setPlusOne(e.target.checked);
              if (!e.target.checked) {
                setGuests([{ ...emptyGuest }]);
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  Object.keys(next).forEach((k) => {
                    if (k.startsWith("guest-")) delete next[k];
                  });
                  return next;
                });
              }
            }}
            className="w-4 h-4 rounded border-line text-gold focus:ring-gold"
          />
          <span className="text-sm font-medium text-ink">
            I&apos;m coming with a guest
          </span>
        </label>

        {plusOne && (
          <div className="space-y-4 pl-7">
            {guests.map((guest, i) => (
              <div
                key={i}
                className="border border-line rounded-lg p-4 bg-cream/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-ink">
                    Guest {i + 1}
                  </h4>
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
                      onChange={(e) =>
                        updateGuest(i, "fullname", e.target.value)
                      }
                      placeholder="Jane Doe"
                      className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold ${
                        fieldErrors[`guest-${i}-fullname`]
                          ? "border-red-400 bg-red-50"
                          : "border-line"
                      }`}
                    />
                    {fieldErrors[`guest-${i}-fullname`] && (
                      <p className="text-xs text-red-500">
                        {fieldErrors[`guest-${i}-fullname`]}
                      </p>
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
                      <p className="text-xs text-red-500">
                        {fieldErrors[`guest-${i}-phone`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-ink">
                      Email
                    </label>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) =>
                        updateGuest(i, "email", e.target.value)
                      }
                      placeholder="jane@example.com"
                      className={`w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold ${
                        fieldErrors[`guest-${i}-email`]
                          ? "border-red-400 bg-red-50"
                          : "border-line"
                      }`}
                    />
                    {fieldErrors[`guest-${i}-email`] && (
                      <p className="text-xs text-red-500">
                        {fieldErrors[`guest-${i}-email`]}
                      </p>
                    )}
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
          </div>
        )}
      </div>

      {/* WhatsApp opt-in */}
      <div className="space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-line text-gold focus:ring-gold"
          />
          <span className="text-sm text-ink">
            I agree to be added to the event&apos;s WhatsApp group
          </span>
        </label>
      </div>

      {/* Submit */}
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
