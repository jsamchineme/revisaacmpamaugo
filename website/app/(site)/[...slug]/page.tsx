import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/shared/SectionRenderer";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

const SEO_META: Record<string, { title: string; description: string }> = {
  about: {
    title: "Our Story | Rev. Isaac Mpamaugo & Rev. Mrs. Edith Mpamaugo",
    description:
      "The life and shared ministry of Rev. Isaac Mpamaugo and his co-ministry partner Rev. Mrs. Edith Mpamaugo.",
  },
  ministry: {
    title: "Ministry & Invitations | Rev. Isaac & Rev. Mrs. Edith Mpamaugo",
    description:
      "Preaching, Bible teaching, prayer, and marriage & family ministry. Invite Rev. Isaac or Rev. Mrs. Edith to minister.",
  },
  contact: {
    title: "Contact | Rev. Isaac & Rev. Mrs. Edith Mpamaugo",
    description:
      "Request prayer, ask a question, or invite Rev. Isaac or Rev. Mrs. Edith to minister.",
  },
  sermons: {
    title: "Sermons & Teachings | Rev. Isaac Mpamaugo",
    description:
      "Browse sermons and Bible teachings on faith, family, Scripture, and prayer.",
  },
  events: {
    title: "Events & Outreach | Rev. Isaac Mpamaugo",
    description:
      "Evangelistic gatherings, crusades, conferences, and outreach to widows and the community.",
  },
};

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageSlug = slug.join("/");
  const meta = SEO_META[pageSlug];

  if (meta) {
    return {
      title: meta.title,
      description: meta.description,
    };
  }

  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { title: true, metaDescription: true },
  });

  if (!page) {
    return { title: "Page Not Found" };
  }

  return {
    title: `${page.title} | Rev. Isaac Mpamaugo`,
    description: page.metaDescription ?? "",
  };
}

async function getPageContext(pageSlug: string) {
  // For pages that may need sermons/events preview, fetch them
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
      orderBy: { createdAt: "desc" },
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

  return { sermons, events, testimonials };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const pageSlug = slug.join("/");

  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
  });

  if (!page || !page.published) {
    notFound();
  }

  const sections = page.sections ? JSON.parse(page.sections) : [];
  const context = await getPageContext(pageSlug);

  return <SectionRenderer sections={sections} context={context} />;
}
