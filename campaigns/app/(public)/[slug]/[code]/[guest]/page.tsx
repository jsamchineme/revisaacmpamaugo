import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import EventPageClient from "../../../events/[slug]/EventPageClient";

export const revalidate = 60;

const GUEST_SLUG_TO_NOI: Record<string, number> = {
  guestone: 1,
  guestwo: 2,
  guesthree: 3,
  guestfour: 4,
  guestfive: 5,
};

interface PageProps {
  params: Promise<{ slug: string; code: string; guest: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug }, select: { title: true } });
  return { title: event?.title ?? "Event" };
}

export default async function GuestLinkPage({ params }: PageProps) {
  const { slug, code, guest } = await params;

  const noi = GUEST_SLUG_TO_NOI[guest];
  if (!noi) return notFound();

  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) return notFound();

  const invitation = await prisma.invitationCode.findFirst({
    where: { eventId: event.id, code, noi },
  });
  if (!invitation) return notFound();

  const registrations = await prisma.registration.findMany({
    where: { eventId: event.id },
    select: { plusOneGuests: true },
  });

  const attendeeCount = registrations.reduce((sum, r) => {
    let guestCount = 0;
    if (r.plusOneGuests) {
      try {
        const guests = JSON.parse(r.plusOneGuests);
        if (Array.isArray(guests)) guestCount = guests.length;
      } catch {
        // ignore
      }
    }
    return sum + 1 + guestCount;
  }, 0);

  const now = new Date();
  const eventDate = new Date(event.date);
  const isPast = eventDate < now;
  const isFull =
    event.capacity !== null && event.capacity !== undefined
      ? attendeeCount >= event.capacity
      : false;

  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <EventPageClient
      event={{
        id: event.id,
        title: event.title,
        slug: event.slug,
        date: event.date.toISOString(),
        formattedDate,
        formattedTime,
        description: event.description,
        capacity: event.capacity,
        imageUrl: event.imageUrl,
        designContent: event.designContent,
        formConfig: event.formConfig,
      }}
      attendeeCount={attendeeCount}
      isPast={isPast}
      isFull={isFull}
      numberOfInvitees={noi}
    />
  );
}
