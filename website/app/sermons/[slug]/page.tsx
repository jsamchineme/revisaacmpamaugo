import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export default async function SermonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sermon = await prisma.sermon.findUnique({
    where: { slug, published: true },
  });

  if (!sermon) return notFound();

  return (
    <article className="min-h-screen">
      <section className="bg-cream py-20 border-b border-line">
        <div className="wrap text-center">
          <span className="text-gold-dark text-sm font-semibold tracking-widest uppercase">
            {sermon.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">{sermon.title}</h1>
          {sermon.scriptureRef && (
            <p className="text-muted italic font-serif text-lg">{sermon.scriptureRef}</p>
          )}
        </div>
      </section>

      <section className="section-padding">
        <div className="wrap max-w-3xl mx-auto">
          {sermon.audioUrl && (
            <div className="mb-8">
              <audio controls className="w-full">
                <source src={sermon.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {sermon.videoUrl && (
            <div className="mb-8 aspect-video">
              <iframe
                src={sermon.videoUrl}
                className="w-full h-full rounded"
                allowFullScreen
              />
            </div>
          )}

          {sermon.body && (
            <div
              className="prose prose-lg max-w-none prose-headings:font-serif prose-h2:text-2xl prose-h3:text-xl prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-gold"
              dangerouslySetInnerHTML={{ __html: sermon.body }}
            />
          )}
        </div>
      </section>
    </article>
  );
}
