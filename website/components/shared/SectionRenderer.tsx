"use client";

import Link from "next/link";
import {
  HeroSection,
  TrustBar,
  FeatureBlock,
  SplitBlock,
  SectionHead,
  Card,
  Quote,
  CtaBand,
  PageHero,
  StepNumber,
  FAQItem,
  FilterBar,
  InfoRow,
  SocialLinks,
} from "@/components/shared";

// ============================================================
// Section Renderer — maps section `type` + `content` to the
// correct component. Add new section types here.
// ============================================================

interface Section {
  id: string;
  type: string;
  order: number;
  content: Record<string, any>;
}

export interface SectionRendererContext {
  sermons?: {
    slug: string;
    title: string;
    description: string | null;
    category: string | null;
    scriptureRef: string | null;
    imageUrl: string | null;
  }[];
  events?: {
    slug: string;
    title: string;
    excerpt: string | null;
    category: string | null;
    date: string | null;
    imageUrl: string | null;
  }[];
  testimonials?: {
    quote: string;
    author: string;
    role?: string | null;
  }[];
}

interface SectionRendererProps {
  sections: Section[];
  context?: SectionRendererContext;
}

export function SectionRenderer({ sections, context }: SectionRendererProps) {
  const sorted = [...sections].sort((a, b) => a.order - b.order);

  return (
    <>
      {sorted.map((section) => {
        const { content } = section;
        const key = section.id;

        switch (section.type) {
          // ── Hero ───────────────────────────────────
          case "hero":
            return (
              <HeroSection
                key={key}
                headline={content.headline}
                subheadline={content.subheadline}
                backgroundImage={content.backgroundImage}
                primaryButtonLabel={content.buttons?.[0]?.label}
                primaryButtonHref={content.buttons?.[0]?.href}
                secondaryButtonLabel={content.buttons?.[1]?.label}
                secondaryButtonHref={content.buttons?.[1]?.href}
              />
            );

          // ── Trust Strip ────────────────────────────
          case "trustStrip":
            return <TrustBar key={key} stats={content.stats ?? []} />;

          // ── Features Grid ──────────────────────────
          case "featuresGrid":
            return (
              <section key={key} className="section-padding">
                <div className="wrap">
                  <SectionHead
                    eyebrow={content.eyebrow}
                    title={content.title}
                    subtitle={content.subtitle}
                  />
                  <div className="grid grid-cols-3 gap-[28px] max-[900px]:grid-cols-1">
                    {(content.features ?? []).map(
                      (f: { icon: string; title: string; description: string }, i: number) => (
                        <FeatureBlock
                          key={i}
                          icon={f.icon}
                          title={f.title}
                          description={f.description}
                        />
                      )
                    )}
                  </div>
                </div>
              </section>
            );

          // ── About Preview (Split Block) ────────────
          case "aboutPreview":
            return (
              <section key={key} className="section-padding bg-cream">
                <div className="wrap">
                  <SplitBlock
                    imageUrl={content.imageUrl}
                    imageAlt={content.imageAlt ?? content.title}
                    eyebrow={content.eyebrow}
                    title={content.headline}
                    description={content.body}
                    extraParagraphs={content.extraParagraphs}
                    buttonLabel={content.ctaLabel}
                    buttonHref={content.ctaLink}
                  />
                </div>
              </section>
            );

          // ── Sermons Preview ────────────────────────
          case "sermonsPreview":
            const previewCount = content.count ?? 3;
            const sermons = (context?.sermons ?? []).slice(0, previewCount);
            return (
              <section key={key} className="section-padding">
                <div className="wrap">
                  <SectionHead
                    eyebrow={content.eyebrow}
                    title={content.title}
                    subtitle={content.subtitle}
                  />
                  {sermons.length > 0 ? (
                    <div className="grid grid-cols-3 gap-[28px] max-[900px]:grid-cols-1">
                      {sermons.map((s) => (
                        <Card
                          key={s.slug}
                          imageUrl={s.imageUrl ?? "/images/sermon-placeholder.svg"}
                          imageAlt={s.title}
                          tag={s.category ?? undefined}
                          title={s.title}
                          description={s.description ?? ""}
                          linkLabel="Watch / Listen →"
                          onLinkClick={() => {}}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted">No sermons available yet.</p>
                  )}
                  <div className="text-center mt-[44px]">
                    <Link
                      href="/sermons"
                      className="inline-block py-[14px] px-[30px] rounded-full bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-[0.02em] transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
                    >
                      View All Sermons
                    </Link>
                  </div>
                </div>
              </section>
            );

          // ── Events Preview ─────────────────────────
          case "eventsPreview":
            const eventPreviewCount = content.count ?? 3;
            const events = (context?.events ?? []).slice(0, eventPreviewCount);
            return (
              <section key={key} className="section-padding bg-cream">
                <div className="wrap">
                  <SectionHead
                    eyebrow={content.eyebrow}
                    title={content.title}
                    subtitle={content.subtitle}
                  />
                  {events.length > 0 ? (
                    <div className="grid grid-cols-3 gap-[28px] max-[900px]:grid-cols-1">
                      {events.map((e) => (
                        <Card
                          key={e.slug}
                          imageUrl={e.imageUrl ?? "/images/event-placeholder.svg"}
                          imageAlt={e.title}
                          tag={e.category ? `${e.category} · ${e.date ?? ""}` : (e.date ?? undefined)}
                          title={e.title}
                          description={e.excerpt ?? ""}
                          linkLabel="Read More →"
                          onLinkClick={() => {}}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted">No events available yet.</p>
                  )}
                  <div className="text-center mt-[44px]">
                    <Link
                      href="/events"
                      className="inline-block py-[14px] px-[30px] rounded-full bg-transparent text-ink border-[1.5px] border-line font-sans font-medium text-[.95rem] tracking-[0.02em] transition-[250ms] hover:border-gold hover:text-gold-dark"
                    >
                      See All Events
                    </Link>
                  </div>
                </div>
              </section>
            );

          // ── Testimonials ───────────────────────────
          case "testimonials":
            const quotes = content.quotes ?? context?.testimonials ?? [];
            return (
              <section key={key} className="section-padding">
                <div className="wrap">
                  <SectionHead
                    eyebrow={content.eyebrow}
                    title={content.title}
                  />
                  <div className="grid grid-cols-3 gap-[28px] max-[900px]:grid-cols-1">
                    {quotes.map(
                      (q: { text?: string; quote?: string; author: string }, i: number) => (
                        <Quote key={i} text={q.text ?? q.quote ?? ""} author={q.author} />
                      )
                    )}
                  </div>
                </div>
              </section>
            );

          // ── CTA Band ───────────────────────────────
          case "ctaBand":
            return (
              <section key={key} className="section-padding" style={{ paddingTop: 0 }}>
                <div className="wrap">
                  <CtaBand
                    headline={content.headline}
                    description={content.description}
                    buttonLabel={content.buttonLabel}
                    buttonHref={content.buttonLink}
                  />
                </div>
              </section>
            );

          // ── Text Content ───────────────────────────
          case "textContent":
            return (
              <section key={key} className="section-padding">
                <div className="wrap max-w-[820px]">
                  {content.eyebrow && (
                    <p className="text-lead text-muted mb-[24px]">{content.eyebrow}</p>
                  )}
                  {(content.paragraphs ?? []).map((p: string, i: number) => (
                    <p key={i} className="mb-[18px] text-muted">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            );

          // ── FAQ ────────────────────────────────────
          case "faq":
            return (
              <section key={key} className="section-padding bg-cream">
                <div className="wrap">
                  <SectionHead
                    eyebrow={content.eyebrow}
                    title={content.title}
                  />
                  <div className="max-w-faq mx-auto">
                    {(content.items ?? []).map(
                      (item: { question: string; answer: string }, i: number) => (
                        <FAQItem
                          key={i}
                          question={item.question}
                          answer={item.answer}
                        />
                      )
                    )}
                  </div>
                  {content.bottomCtaLabel && (
                    <div className="text-center mt-[48px]">
                      <a
                        href={content.bottomCtaLink ?? "#"}
                        className="inline-block py-[14px] px-[30px] rounded-full bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-[0.02em] transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
                      >
                        {content.bottomCtaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            );

          // ── Steps ──────────────────────────────────
          case "steps":
            return (
              <section key={key} className="section-padding bg-cream">
                <div className="wrap">
                  <SectionHead
                    eyebrow={content.eyebrow}
                    title={content.title}
                    subtitle={content.subtitle}
                  />
                  <div className="grid grid-cols-3 gap-[30px] max-[900px]:grid-cols-1">
                    {(content.steps ?? []).map(
                      (
                        step: { title: string; description: string },
                        i: number
                      ) => (
                        <StepNumber
                          key={i}
                          number={i + 1}
                          title={step.title}
                          description={step.description}
                        />
                      )
                    )}
                  </div>
                </div>
              </section>
            );

          // ── Page Hero ──────────────────────────────
          case "pageHero":
            return (
              <PageHero
                key={key}
                eyebrow={content.eyebrow}
                title={content.headline}
                subtitle={content.subtitle}
              />
            );

          // ── Split Content ──────────────────────────
          case "splitContent":
            return (
              <section key={key} className="section-padding">
                <div className="wrap">
                  <SplitBlock
                    imageUrl={content.imageUrl}
                    imageAlt={content.imageAlt ?? content.headline}
                    eyebrow={content.eyebrow}
                    title={content.headline}
                    description={content.body}
                    extraParagraphs={content.extraParagraphs}
                    buttonLabel={content.ctaLabel}
                    buttonHref={content.ctaLink}
                  />
                </div>
              </section>
            );

          // ── Mission + Vision ───────────────────────
          case "missionVision":
            return (
              <section key={key} className="section-padding bg-cream">
                <div className="wrap grid grid-cols-2 gap-[28px] max-[900px]:grid-cols-1">
                  <div>
                    <div className="font-sans text-eyebrow tracking-eyebrow uppercase text-gold-dark font-semibold mb-[14px]">
                      {content.missionEyebrow ?? "Our Mission"}
                    </div>
                    <h2 className="text-[2.2rem] mb-[18px]">{content.missionTitle}</h2>
                    <p className="text-muted">{content.missionBody}</p>
                  </div>
                  <div>
                    <div className="font-sans text-eyebrow tracking-eyebrow uppercase text-gold-dark font-semibold mb-[14px]">
                      {content.visionEyebrow ?? "What We Believe"}
                    </div>
                    <h2 className="text-[2.2rem] mb-[18px]">{content.visionTitle}</h2>
                    <p className="text-muted">{content.visionBody}</p>
                  </div>
                </div>
              </section>
            );

          // ── Grid ───────────────────────────────────
          case "grid":
            return (
              <section key={key} className="section-padding">
                <div className="wrap">
                  {content.title && (
                    <SectionHead
                      eyebrow={content.eyebrow}
                      title={content.title}
                      subtitle={content.subtitle}
                    />
                  )}
                  <div className="grid grid-cols-3 gap-[28px] max-[900px]:grid-cols-1">
                    {(content.items ?? []).map(
                      (item: { icon: string; title: string; description: string }, i: number) => (
                        <FeatureBlock
                          key={i}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                        />
                      )
                    )}
                  </div>
                  {content.bottomCtaLabel && (
                    <div className="text-center mt-[48px]">
                      <a
                        href={content.bottomCtaLink ?? "#"}
                        className="inline-block py-[14px] px-[30px] rounded-full bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-[0.02em] transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
                      >
                        {content.bottomCtaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </section>
            );

          // ── Contact Form ───────────────────────────
          case "contactForm":
            return (
              <section key={key} className="section-padding">
                <div className="wrap max-w-[820px]">
                  <h2 className="text-[1.8rem] mb-[24px]">Send a Message</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      (e.target as HTMLFormElement).reset();
                    }}
                  >
                    <div className="mb-[20px]">
                      <label className="block text-[.85rem] font-semibold mb-[7px] text-ink">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full py-[14px] px-[16px] border-[1.5px] border-line rounded-[10px] font-sans text-[.95rem] bg-white transition-[200ms] focus:outline-hidden focus:border-gold"
                      />
                    </div>
                    <div className="mb-[20px]">
                      <label className="block text-[.85rem] font-semibold mb-[7px] text-ink">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full py-[14px] px-[16px] border-[1.5px] border-line rounded-[10px] font-sans text-[.95rem] bg-white transition-[200ms] focus:outline-hidden focus:border-gold"
                      />
                    </div>
                    <div className="mb-[20px]">
                      <label className="block text-[.85rem] font-semibold mb-[7px] text-ink">
                        Phone
                      </label>
                      <input
                        type="tel"
                        className="w-full py-[14px] px-[16px] border-[1.5px] border-line rounded-[10px] font-sans text-[.95rem] bg-white transition-[200ms] focus:outline-hidden focus:border-gold"
                      />
                    </div>
                    <div className="mb-[20px]">
                      <label className="block text-[.85rem] font-semibold mb-[7px] text-ink">
                        Message
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Share a prayer request, a question, or an invitation…"
                        required
                        className="w-full py-[14px] px-[16px] border-[1.5px] border-line rounded-[10px] font-sans text-[.95rem] bg-white transition-[200ms] focus:outline-hidden focus:border-gold resize-y"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-block py-[14px] px-[30px] rounded-full bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-[0.02em] cursor-pointer border-none transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </section>
            );

          // ── Contact Info ───────────────────────────
          case "contactInfo":
            return (
              <section key={key} className="section-padding" style={{ paddingTop: 0 }}>
                <div className="wrap max-w-[820px]">
                  <h2 className="text-[1.8rem] mb-[24px]">Contact Details</h2>
                  {(content.infoRows ?? []).map(
                    (row: { icon: string; label: string; value: string }, i: number) => (
                      <InfoRow
                        key={i}
                        icon={row.icon}
                        label={row.label}
                        value={row.value}
                      />
                    )
                  )}
                  <b className="font-serif text-[1.1rem] block mt-[18px] mb-[8px]">
                    {content.socialsHeading ?? "Follow the Ministry"}
                  </b>
                  <SocialLinks links={content.socialLinks ?? []} />
                  {content.mapUrl && (
                    <div className="mt-[24px] rounded overflow-hidden border border-line">
                      <iframe
                        loading="lazy"
                        src={content.mapUrl}
                        title="Location map"
                        className="w-full h-[240px] border-0 block"
                      />
                    </div>
                  )}
                </div>
              </section>
            );

          // ── Image Block ────────────────────────────
          case "imageBlock":
            return (
              <section key={key} className="section-padding">
                <div className="wrap max-w-[820px]">
                  <img
                    src={content.imageUrl}
                    alt={content.caption ?? ""}
                    className="rounded shadow-card w-full"
                  />
                  {content.caption && (
                    <p className="text-center text-muted text-[.92rem] mt-[12px]">
                      {content.caption}
                    </p>
                  )}
                </div>
              </section>
            );

          // ── Fallback ───────────────────────────────
          default:
            console.warn(`Unknown section type: ${section.type}`);
            return null;
        }
      })}
    </>
  );
}
