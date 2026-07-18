"use client";

import { useState } from "react";
import DynamicRSVPForm from "./DynamicRSVPForm";

interface FormConfig {
  title: string;
  fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    conditional?: string[];
  }>;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  date: string;
  formattedDate: string;
  formattedTime: string;
  description: string | null;
  capacity: number | null;
  imageUrl: string | null;
  designContent: string | null;
  formConfig: string | null;
}

interface EventPageClientProps {
  event: EventData;
  registrationCount: number;
  isPast: boolean;
  isFull: boolean;
}

export default function EventPageClient({
  event,
  registrationCount,
  isPast,
  isFull,
}: EventPageClientProps) {
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const capacityText =
    event.capacity !== null && event.capacity !== undefined
      ? `${registrationCount} / ${event.capacity} registered`
      : `${registrationCount} registered`;

  const spotsLeft =
    event.capacity !== null && event.capacity !== undefined
      ? Math.max(0, event.capacity - registrationCount)
      : null;

  const isRegistrationOpen = !isPast && !isFull;

  let formConfig: FormConfig | null = null;
  if (event.formConfig) {
    try {
      formConfig = JSON.parse(event.formConfig);
    } catch {
      formConfig = null;
    }
  }

  // Build the RSVP form component
  const rsvpFormElement = rsvpSuccess ? (
    <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-6">
      <h3 className="font-serif text-lg font-semibold text-green-900 mb-2">
        Registration successful!
      </h3>
      <p className="text-green-800 text-sm">
        Thank you for registering for {event.title}. We look forward to seeing you on {event.formattedDate}.
      </p>
    </div>
  ) : !isRegistrationOpen ? null : formConfig ? (
    <DynamicRSVPForm
      eventSlug={event.slug}
      formConfig={formConfig}
      onSuccess={() => setRsvpSuccess(true)}
    />
  ) : (
    <div className="bg-cream border border-line rounded-lg p-6 text-center text-muted">
      <p>RSVP form is being configured. Please check back later.</p>
    </div>
  );

  // Registration status bar
  const statusBar = (
    <div className="flex items-center justify-between bg-cream rounded-lg px-5 py-4 mb-8 border border-line">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${isRegistrationOpen ? "bg-green-600" : "bg-red-500"}`} />
        <span className="text-sm font-medium text-ink">
          {isRegistrationOpen
            ? "Registration open"
            : isPast
              ? "Registration closed"
              : "Registration closed — event is full"}
        </span>
      </div>
      <span className="text-sm text-muted">{capacityText}</span>
    </div>
  );

  // Closed messages
  const closedMessage = isPast ? (
    <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 mb-8">
      <p className="text-red-800 text-sm font-medium">This event has ended. Registration is closed.</p>
    </div>
  ) : isFull ? (
    <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 mb-8">
      <p className="text-red-800 text-sm font-medium">Registration closed — event is full.</p>
    </div>
  ) : null;

  // Spots remaining
  const spotsMessage = isRegistrationOpen && spotsLeft !== null ? (
    <div className="mb-8">
      <p className="text-sm text-muted">
        {spotsLeft === 0
          ? "No spots remaining"
          : spotsLeft === 1
            ? "1 spot remaining"
            : `${spotsLeft} spots remaining`}
      </p>
    </div>
  ) : null;

  // If there's a custom HTML design, serve it via iframe so scripts execute
  // and the RSVP form is injected server-side by the render route
  if (event.designContent) {
    return (
      <iframe
        src={`/api/events/${event.slug}/render`}
        title={event.title}
        style={{
          display: "block",
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    );
  }

  // Fallback: default layout when no custom design exists
  return (
    <article className="min-h-screen bg-paper">
      <section className="bg-cream text-center border-b border-line" style={{ padding: "80px 0" }}>
        <div className="mx-auto px-4" style={{ maxWidth: 820 }}>
          <h1
            className="font-serif font-semibold leading-[1.15] text-ink mb-[10px]"
            style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)" }}
          >
            {event.title}
          </h1>
          <p className="text-muted text-[1rem] mt-[10px]">
            {event.formattedDate} at {event.formattedTime}
          </p>
        </div>
      </section>

      <section className="py-[48px] md:py-[64px]">
        <div className="mx-auto px-4" style={{ maxWidth: 760 }}>
          <div className="border-b border-line mb-[32px]" />

          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full rounded mb-[32px]"
              style={{ aspectRatio: "16/9", objectFit: "cover" }}
            />
          )}

          {event.description ? (
            <div className="mb-[32px]">
              <p className="text-[1.05rem] leading-[1.8] text-ink whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          ) : (
            <p className="text-muted italic mb-[32px]">No description available for this event.</p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16 border-t border-line bg-paper">
        <div className="mx-auto px-4" style={{ maxWidth: 760 }}>
          {statusBar}
          {closedMessage}
          {spotsMessage}
          {rsvpFormElement}
          <div className="mt-12 pt-8 border-t border-line">
            <a
              href="/"
              className="inline-block font-semibold text-[.9rem] text-burgundy hover:text-gold-dark transition-colors"
            >
              ← Back to home
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
