import { prisma } from "@/lib/db";
import { Card, PageHero } from "@/components/shared";

export const metadata = {
  title: "Teachings | Rev. Isaac Mpamaugo",
  description: "Full-length written teachings to read slowly and return to — drawn from a lifetime in the Word.",
};

export const revalidate = 60;

export default async function TeachingsPage() {
  const teachings = await prisma.teaching.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = ["All", ...new Set(teachings.map((t) => t.category).filter(Boolean))];

  return (
    <div>
      <PageHero
        eyebrow="Read & Reflect"
        title="Teachings"
        subtitle="Full-length written teachings to read slowly and return to — drawn from a lifetime in the Word."
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
            {teachings.map((teaching) => (
              <Card
                key={teaching.id}
                title={teaching.title}
                description={teaching.excerpt || ""}
                tag={teaching.category || "Teaching"}
                imageUrl={teaching.imageUrl || "/images/teaching-placeholder.svg"}
                href={`/teachings/${teaching.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
