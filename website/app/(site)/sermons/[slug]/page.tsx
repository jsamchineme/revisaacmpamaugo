import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export default async function SermonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sermon = await prisma.sermon.findUnique({
    where: { slug, published: true },
  });

  if (!sermon) return notFound();

  return (
    <article className="min-h-screen bg-paper">
      {/* Page hero — matches .phero from template */}
      <section className="bg-cream text-center border-b border-line" style={{ padding: "80px 0" }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          {sermon.category && (
            <div className="font-sans text-[.78rem] tracking-[.22em] uppercase text-gold-dark font-semibold mb-[14px]">
              {sermon.category}
            </div>
          )}
          <h1
            className="font-serif font-semibold leading-[1.15] text-ink mb-[10px]"
            style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)" }}
          >
            {sermon.title}
          </h1>
          {sermon.scriptureRef && (
            <p className="font-serif italic text-[1.15rem] text-gold-dark mt-[10px]">
              {sermon.scriptureRef}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="wrap" style={{ maxWidth: 760 }}>
          {/* Divider below scripture ref */}
          <div className="border-b border-line mb-[32px]" />

          {sermon.audioUrl && (
            <div className="mb-[32px]">
              <audio controls className="w-full rounded-[10px]">
                <source src={sermon.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {sermon.videoUrl && (
            <div className="mb-[32px] aspect-video rounded overflow-hidden">
              <iframe
                src={sermon.videoUrl}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          {sermon.imageUrl && !sermon.videoUrl && (
            <img
              src={sermon.imageUrl}
              alt={sermon.title}
              className="w-full rounded mb-[32px]"
              style={{ aspectRatio: "16/9", objectFit: "cover" }}
            />
          )}

          {sermon.description && (
            <p className="font-serif italic text-[1.18rem] text-ink mb-[28px] pb-[28px] border-b border-line">
              {sermon.description}
            </p>
          )}

          {sermon.body ? (
            <div
              className="prose prose-lg max-w-none prose-headings:font-serif prose-h2:text-[1.8rem] prose-h3:text-[1.4rem] prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-gold prose-p:text-[1.05rem] prose-p:leading-[1.8]"
              style={{ color: "#3a352e" }}
              dangerouslySetInnerHTML={{ __html: sermon.body }}
            />
          ) : (
            <p className="text-muted italic">No content available for this sermon yet.</p>
          )}

          {/* Back link */}
          <div className="mt-[48px] pt-[32px] border-t border-line">
            <Link
              href="/sermons"
              className="inline-block font-semibold text-[.9rem] text-burgundy hover:text-gold-dark transition-colors"
            >
              ← Back to all sermons
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
