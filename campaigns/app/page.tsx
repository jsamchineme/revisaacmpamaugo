import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const featuredSetting = await prisma.setting.findUnique({
    where: { key: "featuredEventId" },
  });

  if (featuredSetting?.value) {
    const event = await prisma.event.findUnique({
      where: { id: featuredSetting.value },
      select: { title: true },
    });

    if (event?.title) {
      return { title: event.title };
    }
  }

  return { title: "Campaign Manager" };
}

export default async function RootPage() {
  const [featuredSetting, fallbackSetting] = await Promise.all([
    prisma.setting.findUnique({ where: { key: "featuredEventId" } }),
    prisma.setting.findUnique({ where: { key: "fallbackUrl" } }),
  ]);

  if (featuredSetting?.value) {
    const event = await prisma.event.findUnique({
      where: { id: featuredSetting.value },
      select: { slug: true, designContent: true },
    });

    if (event) {
      if (event.designContent) {
        // Serve the rendered design inline so the root URL stays as /
        return (
          <iframe
            src={`/api/events/${event.slug}/render`}
            title="Event"
            style={{
              display: "block",
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        );
      }
      redirect(`/events/${event.slug}`);
    }
  }

  const fallbackUrl = fallbackSetting?.value;
  if (fallbackUrl) redirect(fallbackUrl);

  redirect("/admin");
}
