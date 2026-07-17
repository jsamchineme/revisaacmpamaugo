import { prisma } from "@/lib/db";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://revisaacmpamaugo.online";

export const revalidate = 3600; // regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, sermons, teachings, events] = await Promise.all([
    prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.sermon.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.teaching.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  // Static routes (home is slug="home")
  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => {
    // Home page is at /
    const urlPath = page.slug === "home" ? "" : page.slug;
    return {
      url: `${BASE_URL}/${urlPath}`,
      lastModified: page.updatedAt,
      changeFrequency: "daily" as const,
      priority: page.slug === "home" ? 1.0 : 0.8,
    };
  });

  // Sermons
  const sermonEntries: MetadataRoute.Sitemap = sermons.map((s) => ({
    url: `${BASE_URL}/sermons/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Teachings
  const teachingEntries: MetadataRoute.Sitemap = teachings.map((t) => ({
    url: `${BASE_URL}/teachings/${t.slug}`,
    lastModified: t.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Events
  const eventEntries: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...pageEntries, ...sermonEntries, ...teachingEntries, ...eventEntries];
}
