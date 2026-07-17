import { prisma } from "@/lib/db";
import { PageHero } from "@/components/shared";
import { TeachingsClient } from "./TeachingsClient";

export const metadata = {
  title: "Teachings | Rev. Isaac Mpamaugo",
  description: "Full-length written teachings to read slowly and return to — drawn from a lifetime in the Word.",
};

export const revalidate = 60;

export default async function TeachingsPage() {
  const teachings = await prisma.teaching.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      category: true,
      imageUrl: true,
    },
  });

  const categories = [
    "All",
    ...new Set(teachings.map((t) => t.category).filter(Boolean) as string[]),
  ];

  return (
    <div>
      <PageHero
        eyebrow="Read & Reflect"
        title="Teachings"
        subtitle="Full-length written teachings to read slowly and return to — drawn from a lifetime in the Word."
      />

      <section className="section-padding">
        <div className="wrap">
          <TeachingsClient teachings={teachings} categories={categories} />
        </div>
      </section>
    </div>
  );
}
