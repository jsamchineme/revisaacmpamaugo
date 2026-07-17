import { prisma } from "@/lib/db";
import { Card, PageHero } from "@/components/shared";

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

  const categories = ["All", ...new Set(events.map((e) => e.category).filter(Boolean))];

  return (
    <div>
      <PageHero
        eyebrow="Posts"
        title="Events & Outreach"
        subtitle="A look at the ministry in action — evangelistic gatherings, outreach to the vulnerable, and moments of faith and fellowship."
      />

      <section className="section-padding">
        <div className="wrap">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                className="px-5 py-2 rounded-full border border-line text-sm font-medium text-muted hover:border-gold transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {events.map((event) => (
              <Card
                key={event.id}
                title={event.title}
                description={event.excerpt || ""}
                tag={`${event.category || "Event"} · ${event.date ? new Date(event.date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : ""}`}
                imageUrl={event.imageUrl || "/images/event-placeholder.svg"}
                href={`/events/${event.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
