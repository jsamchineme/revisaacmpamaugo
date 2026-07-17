import { prisma } from "@/lib/db";
import { PageHero } from "@/components/shared";
import { SermonsClient } from "./SermonsClient";

export const metadata = {
  title: "Sermons & Teachings | Rev. Isaac Mpamaugo",
  description: "Browse sermons and Bible teachings on faith, family, Scripture, and prayer.",
};

export const revalidate = 60;

export default async function SermonsPage() {
  const sermons = await prisma.sermon.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      imageUrl: true,
    },
  });

  const categories = [
    "All",
    ...new Set(sermons.map((s) => s.category).filter(Boolean) as string[]),
  ];

  return (
    <div>
      <PageHero
        eyebrow="Listen & Read"
        title="Sermons & Teachings"
        subtitle="Messages preached and lessons taught over a lifetime of ministry — on faith, family, Scripture, and the faithfulness of God."
      />

      <section className="section-padding">
        <div className="wrap">
          <SermonsClient sermons={sermons} categories={categories} />
        </div>
      </section>
    </div>
  );
}
