import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug, published: true },
  });

  if (!event) return notFound();

  return (
    <article className="min-h-screen">
      <section className="bg-cream py-20 border-b border-line">
        <div className="wrap text-center">
          <span className="text-gold-dark text-sm font-semibold tracking-widest uppercase">
            {event.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">{event.title}</h1>
          {event.date && (
            <p className="text-muted">
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="wrap max-w-3xl mx-auto">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-auto rounded mb-8"
            />
          )}

          {event.body && (
            <div
              className="prose prose-lg max-w-none prose-headings:font-serif prose-h2:text-2xl prose-h3:text-xl prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-gold"
              dangerouslySetInnerHTML={{ __html: event.body }}
            />
          )}
        </div>
      </section>
    </article>
  );
}
