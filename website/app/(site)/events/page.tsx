import { prisma } from "@/lib/db";
import { PageHero } from "@/components/shared";
import { EventsClient } from "./EventsClient";

export const metadata = {
  title: "Events & Outreach | Rev. Isaac Mpamaugo",
  description: "Evangelistic gatherings, crusades, conferences, and outreach to widows and the community.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });

  const categories = ["All", ...new Set(events.map((e) => e.category).filter(Boolean))] as string[];

  return (
    <div>
      <PageHero
        eyebrow="Posts"
        title="Events & Outreach"
        subtitle="A look at the ministry in action — evangelistic gatherings, outreach to the vulnerable, and moments of faith and fellowship."
      />

      <section className="section-padding">
        <div className="wrap">
          <EventsClient events={events} categories={categories} />
        </div>
      </section>
    </div>
  );
}
