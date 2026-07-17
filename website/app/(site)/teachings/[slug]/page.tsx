import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export default async function TeachingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const teaching = await prisma.teaching.findUnique({
    where: { slug, published: true },
  });

  if (!teaching) return notFound();

  return (
    <article className="min-h-screen bg-paper">
      {/* Page hero — cream header matching sermon detail */}
      <section className="bg-cream text-center border-b border-line" style={{ padding: "80px 0" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          {teaching.category && (
            <div className="font-sans text-[.78rem] tracking-[.22em] uppercase text-gold-dark font-semibold mb-[14px]">
              {teaching.category}
            </div>
          )}
          <h1
            className="font-serif font-semibold leading-[1.15] text-ink mb-[10px]"
            style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)" }}
          >
            {teaching.title}
          </h1>
          {teaching.scriptureRef && (
            <p className="font-serif italic text-[1.15rem] text-gold-dark mt-[10px]">
              {teaching.scriptureRef}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="border-b border-line mb-[32px]" />

          {teaching.imageUrl && (
            <img
              src={teaching.imageUrl}
              alt={teaching.title}
              className="w-full rounded mb-[32px]"
              style={{ aspectRatio: "16/9", objectFit: "cover" }}
            />
          )}

          {teaching.excerpt && (
            <p className="font-serif italic text-[1.18rem] text-ink mb-[28px] pb-[28px] border-b border-line">
              {teaching.excerpt}
            </p>
          )}

          {teaching.body ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-serif prose-h2:text-[1.8rem] prose-h3:text-[1.4rem] prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-gold prose-p:text-[1.05rem] prose-p:leading-[1.8]"
              style={{ color: "#3a352e" }}
              dangerouslySetInnerHTML={{ __html: teaching.body }}
            />
          ) : (
            <p className="text-muted italic">No content available for this teaching yet.</p>
          )}

          {/* Back link */}
          <div className="mt-[48px] pt-[32px] border-t border-line">
            <Link
              href="/teachings"
              className="inline-block font-semibold text-[.9rem] text-burgundy hover:text-gold-dark transition-colors"
            >
              ← Back to all teachings
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
