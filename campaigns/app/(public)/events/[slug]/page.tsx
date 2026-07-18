import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import EventPageClient from "./EventPageClient";

export const revalidate = 60;

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    return notFound();
  }

  const registrationCount = await prisma.registration.count({
    where: { eventId: event.id },
  });

  const now = new Date();
  const eventDate = new Date(event.date);
  const isPast = eventDate < now;

  const isFull =
    event.capacity !== null && event.capacity !== undefined
      ? registrationCount >= event.capacity
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
      registrationCount={registrationCount}
      isPast={isPast}
      isFull={isFull}
    />
  );
}
