import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import EventPageClient from "../events/[slug]/EventPageClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: event?.title ?? "Event" };
}

function parseNumberOfInvitees(raw: string | string[] | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  const value = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  if (Number.isNaN(value) || value < 1) return 0;
  return Math.min(value, 5);
}

export default async function RootEventPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { noi } = await searchParams;
  const numberOfInvitees = parseNumberOfInvitees(noi);

  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event) return notFound();

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
      numberOfInvitees={numberOfInvitees}
    />
  );
}
