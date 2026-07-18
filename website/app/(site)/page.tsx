import { SectionRenderer } from "@/components/shared";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Rev. Isaac & Rev. Mrs. Edith Mpamaugo | Sermons, Teachings & Ministries",
  description:
    "Rev. Isaac and Rev. Mrs. Edith Mpamaugo — a lifetime of Gospel ministry, sermons, Bible teaching, missions, and community outreach. Listen, be encouraged, or get in touch.",
};

const defaultSections = [
  {
    id: "hero-1",
    type: "hero",
    order: 0,
    content: {
      headline: "Faithful Service.<br/>Timeless Truth.",
      subheadline:
        "For over 50 years, Rev. Isaac Mpamaugo and his co-ministry partner Rev. Mrs. Edith Mpamaugo have preached the Gospel, served the church, and loved God's people together. This is their lifetime of sermons, teaching, and ministry — shared with all who are seeking.",
      backgroundImage: "/images/hero-couple.png",
      buttons: [
        { label: "Listen to a Sermon", href: "/sermons" },
        { label: "Get in Touch", href: "/contact" },
      ],
    },
  },
  {
    id: "trust-1",
    type: "trustStrip",
    order: 1,
    content: {
      stats: [
        { number: "50+", label: "Years in Ministry" },
        { number: "200", label: "Congregations Served" },
        { number: "Hundreds", label: "Sermons & Teachings" },
        { number: "1,500+", label: "Widows Served Annually" },
      ],
    },
  },

  {
    id: "features-1",
    type: "featuresGrid",
    order: 2,
    content: {
      eyebrow: "OUR PURPOSE",
      title: "A Lifetime of Faithfulness",
      features: [
        {
          icon: "⚓",
          title: "Sermons That Endure",
          description:
            "Decades of preaching, gathered in one place to encourage your faith whenever you need it.",
        },
        {
          icon: "📖",
          title: "Rooted in Scripture",
          description:
            "Clear, practical Bible teaching for everyday Christian living, marriage, and family.",
        },
        {
          icon: "🤝",
          title: "A Shared Calling",
          description:
            "Rev. Isaac and his co-ministry partner Rev. Mrs. Edith Mpamaugo have walked this road together for over 50 years — preaching, teaching, and serving side by side.",
        },
      ],
    },
  },
  {
    id: "about-preview-1",
    type: "aboutPreview",
    order: 3,
    content: {
      eyebrow: "Our Story",
      headline: "A Life Given to the Gospel",
      body: "Rev. Isaac Mpamaugo answered the call to ministry as a young man and has spent his life pointing people to Christ. Beside him every step of the way has been his co-ministry partner Rev. Mrs. Edith Mpamaugo — together they have pastored, taught, counselled, led missions, and prayed with countless families across Nigeria and beyond.",
      extraParagraphs: [
        "Rev. Isaac and Rev. Mrs. Edith remain active in ministry — preaching, teaching, and serving. This site brings their message to you wherever you are.",
      ],
      imageUrl: "/images/about-portrait.png",
      imageAlt: "Portrait of a dignified older minister",
      ctaLabel: "Read Their Story",
      ctaLink: "/about",
    },
  },
  {
    id: "sermons-preview-1",
    type: "sermonsPreview",
    order: 4,
    content: {
      eyebrow: "Recent",
      title: "Sermons & Teachings",
      subtitle: "Messages of hope, faith, and the steadfast love of God.",
      count: 3,
    },
  },
  {
    id: "events-preview-1",
    type: "eventsPreview",
    order: 5,
    content: {
      eyebrow: "In the field",
      title: "Outreach & Events",
      subtitle: "Where the ministry is at work — gatherings, evangelism, and care for the community.",
      count: 3,
    },
  },
  {
    id: "testimonials-1",
    type: "testimonials",
    order: 6,
    content: {
      eyebrow: "Testimonies",
      title: "What People Say",
      quotes: [
        {
          text: "Rev. Mpamaugo's preaching carried our family through our hardest years. His words still steady me today.",
          author: "Grace A., Lagos",
        },
        {
          text: "He and Rev. Mrs. Edith didn't just teach us about faith — they showed us what a faithful life looks like.",
          author: "Pastor Daniel O.",
        },
        {
          text: "Every sermon sends you back to the Scriptures and back to your knees. A true shepherd.",
          author: "Mary E.",
        },
      ],
    },
  },
  {
    id: "cta-1",
    type: "ctaBand",
    order: 7,
    content: {
      headline: "However far the road, grace reaches further.",
      description:
        "Reach out for prayer, an encouraging word, or to invite Rev. Isaac or Rev. Mrs. Edith to minister.",
      buttonLabel: "Get in Touch",
      buttonLink: "/contact",
    },
  },
];

function mergeSections(dbSections: any[], defaults: any[]) {
  if (!dbSections || dbSections.length === 0) return defaults;

  const defaultMap = new Map(defaults.map((s) => [s.type, s]));

  return dbSections.map((dbSec) => {
    const fallback = defaultMap.get(dbSec.type);
    if (!fallback) return dbSec;

    // Merge content: DB content wins for explicit overrides,
    // but fallback fills in missing image/icon fields
    const mergedContent = { ...fallback.content, ...dbSec.content };

    // Special handling for images/icons that may be missing in DB
    if (dbSec.type === "hero" && !dbSec.content?.backgroundImage) {
      mergedContent.backgroundImage = fallback.content.backgroundImage;
    }
    if (dbSec.type === "aboutPreview" && !dbSec.content?.imageUrl) {
      mergedContent.imageUrl = fallback.content.imageUrl;
      mergedContent.imageAlt = fallback.content.imageAlt;
    }
    // If DB has a complete single-body paragraph, use fallback extraParagraphs for the second paragraph
    if (dbSec.type === "aboutPreview" && !dbSec.content?.extraParagraphs) {
      mergedContent.extraParagraphs = fallback.content.extraParagraphs;
    }

    // For featuresGrid: merge feature-by-feature to preserve emoji icons
    if (
      dbSec.type === "featuresGrid" &&
      dbSec.content?.features &&
      fallback.content?.features
    ) {
      mergedContent.features = dbSec.content.features.map(
        (dbFeature: any, i: number) => {
          const fallbackFeature = fallback.content.features[i];
          if (!fallbackFeature) return dbFeature;

          // Use fallback emoji icon if DB has text label (book, lamp, heart)
          const isTextIcon =
            dbFeature.icon && /^[a-z]+$/.test(dbFeature.icon);

          return {
            ...fallbackFeature,
            ...dbFeature,
            icon: isTextIcon ? fallbackFeature.icon : dbFeature.icon,
          };
        }
      );
    }

    if (dbSec.type === "testimonials" && !dbSec.content?.quotes) {
      mergedContent.quotes = fallback.content.quotes;
      mergedContent.eyebrow = fallback.content.eyebrow;
    }
    if (dbSec.type === "ctaBand" && !dbSec.content?.description) {
      mergedContent.description = fallback.content.description;
    }

    return {
      ...dbSec,
      content: mergedContent,
    };
  });
}

export default async function Home() {
  // Fetch home page from DB (admin editor writes here)
  const homePage = await prisma.page.findUnique({
    where: { slug: "home" },
    select: { sections: true },
  });

  let dbSections: any[] = [];

  if (homePage?.sections) {
    try {
      const parsed =
        typeof homePage.sections === "string"
          ? JSON.parse(homePage.sections)
          : homePage.sections;
      dbSections = Array.isArray(parsed) ? parsed : [];
    } catch {
      dbSections = [];
    }
  }

  // Merge DB sections with defaults: DB provides order/structure,
  // defaults fill in missing images/icons/content
  const homeSections = mergeSections(dbSections, defaultSections);

  const [sermons, events, testimonials] = await Promise.all([
    prisma.sermon.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        description: true,
        category: true,
        scriptureRef: true,
        imageUrl: true,
      },
    }),
    prisma.event.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        date: true,
        imageUrl: true,
      },
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: { quote: true, author: true, role: true },
    }),
  ]);

  return (
    <SectionRenderer
      sections={homeSections}
      context={{ sermons, events, testimonials }}
    />
  );
}
