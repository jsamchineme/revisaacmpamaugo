import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/shared";
import { PageHero } from "@/components/shared";

export const metadata = {
  title: "Sermons & Teachings | Rev. Isaac Mpamaugo",
  description: "Browse sermons and Bible teachings on faith, family, Scripture, and prayer.",
};

export const revalidate = 60;

export default async function SermonsPage() {
  const sermons = await prisma.sermon.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = ["All", ...new Set(sermons.map((s) => s.category).filter(Boolean))];

  return (
    <div>
      <PageHero
        eyebrow="Listen & Read"
        title="Sermons & Teachings"
        subtitle="Messages preached and lessons taught over a lifetime of ministry — on faith, family, Scripture, and the faithfulness of God."
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
            {sermons.map((sermon) => (
              <Card
                key={sermon.id}
                title={sermon.title}
                description={sermon.description || ""}
                tag={sermon.category || "Sermon"}
                imageUrl={sermon.imageUrl || "/images/sermon-placeholder.svg"}
                href={`/sermons/${sermon.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
