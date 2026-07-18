import { SectionRenderer } from "@/components/shared";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Give | Rev. Isaac & Rev. Mrs. Edith Mpamaugo",
  description:
    "Partner with the ministry of Rev. Isaac and Rev. Mrs. Edith Mpamaugo through prayer, financial giving, or volunteering.",
};

const defaultSections = [
  {
    id: "pagehero-give",
    type: "pageHero",
    order: 1,
    content: {
      eyebrow: "Give",
      headline: "Partner With This Ministry",
      subtitle:
        "Every gift — however large or small — sustains the preaching of the Gospel, the widows' outreach, and the teaching ministry of Rev. Isaac and Rev. Mrs. Edith Mpamaugo. Thank you for your generosity.",
    },
  },
  {
    id: "grid-give-impact",
    type: "grid",
    order: 2,
    content: {
      eyebrow: "Why Give?",
      title: "Your Gift at Work",
      items: [
        { icon: "📖", title: "Sermons & Teachings", description: "Keeping this archive free and accessible to everyone — anywhere in the world — so that no one is turned away from the Word of God because they cannot afford it." },
        { icon: "❤️", title: "Widows' Outreach", description: "The Life Support Foundation — co-founded and led by Rev. Mrs. Edith Mpamaugo — reaches over 1,500 vulnerable widows in Lagos each year with free medical care, food, and financial empowerment." },
        { icon: "✈️", title: "Missions & Evangelism", description: "Covering the costs of travel, logistics, and materials so that Rev. Isaac and Rev. Mrs. Edith can continue to take the Gospel to churches, crusades, and communities across Nigeria and beyond." },
      ],
    },
  },
  {
    id: "grid-give-other",
    type: "grid",
    order: 3,
    content: {
      eyebrow: "Other Ways to Give",
      title: "More Than Money",
      items: [
        { icon: "🙏", title: "Prayer Partnership", description: "Commit to praying regularly for the ministry, the missions, and the widows' outreach. This is the most powerful form of partnership we know." },
        { icon: "📣", title: "Share the Messages", description: "Share a sermon or teaching with someone who needs it. Spread the word about the Life Support Foundation's work. Every share extends the reach." },
        { icon: "🤝", title: "Volunteer", description: "Are you in Lagos and want to serve at the annual widows' outreach? Contact us — there is always a place for willing hands." },
      ],
    },
  },
  {
    id: "cta-give",
    type: "ctaBand",
    order: 4,
    content: {
      headline: "Every gift is a seed sown in faith.",
      description:
        "We are grateful for every partner who stands with this ministry. Get in touch to discuss how you can give.",
      buttonLabel: "Contact Us to Give",
      buttonLink: "/contact",
    },
  },
];

export default async function GivePage() {
  const dbPage = await prisma.page.findUnique({
    where: { slug: "give" },
    select: { sections: true },
  });

  let sections = defaultSections;
  if (dbPage?.sections) {
    try {
      const parsed =
        typeof dbPage.sections === "string"
          ? JSON.parse(dbPage.sections)
          : dbPage.sections;
      if (Array.isArray(parsed) && parsed.length > 0) sections = parsed;
    } catch {
      // fall through to defaults
    }
  }

  return <SectionRenderer sections={sections} />;
}
