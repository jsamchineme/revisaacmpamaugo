import { SectionRenderer } from "@/components/shared";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Missions | Rev. Isaac & Rev. Mrs. Edith Mpamaugo",
  description:
    "Rev. Isaac and Rev. Mrs. Edith Mpamaugo have carried the Gospel across Nigeria, Africa, and beyond. Partner with the mission through prayer, giving, and invitation.",
};

const defaultSections = [
  {
    id: "pagehero-missions",
    type: "pageHero",
    order: 1,
    content: {
      eyebrow: "Missions",
      headline: "Taking the Gospel to the Nations",
      subtitle:
        "Rev. Isaac and Rev. Mrs. Edith Mpamaugo have carried the Gospel beyond the walls of any single church — across Nigeria, the African continent, and beyond. Missions is not a programme; it is a conviction.",
    },
  },
  {
    id: "grid-missions-areas",
    type: "grid",
    order: 2,
    content: {
      eyebrow: "Areas of Outreach",
      title: "Where They Have Served",
      items: [
        { icon: "🇳🇬", title: "Nigeria", description: "Evangelistic crusades, church conferences, and pastoral visits across Lagos, the South-East, and beyond." },
        { icon: "🌍", title: "Africa", description: "Rev. Isaac has preached at international conventions and ministry gatherings across West and East Africa." },
        { icon: "✈️", title: "Beyond Africa", description: "Both Rev. Isaac and Rev. Mrs. Edith have ministered in the diaspora — speaking into the lives of Nigerian communities abroad and international congregations." },
        { icon: "🏥", title: "Medical Outreach", description: "The Life Support Foundation's annual widows' outreach brings free medical care, food parcels, and empowerment to over 1,500 widows in Lagos each year." },
        { icon: "👩‍👧", title: "Women & Families", description: "Rev. Mrs. Edith's ministry to women crosses borders and generations — discipling, counselling, and equipping wives, mothers, and daughters." },
        { icon: "🌱", title: "Church Planting & Mentoring", description: "Rev. Isaac has mentored pastors and church leaders across Nigeria, pouring hard-won wisdom into the next generation of ministers." },
      ],
    },
  },
  {
    id: "grid-missions-partner",
    type: "grid",
    order: 3,
    content: {
      eyebrow: "Partner With Us",
      title: "Join the Missionary Work",
      items: [
        { icon: "🙏", title: "Pray", description: "The most important thing. Ask for open doors, travelling mercies, and fruitful ministry every time they go." },
        { icon: "💰", title: "Give", description: "Financial partnership sustains the outreach, the widows' programme, and the costs of travel and ministry. Visit the Give page to partner." },
        { icon: "📣", title: "Share", description: "Spread the sermons, teachings, and testimonies of what God has done — every share is a small act of mission." },
        { icon: "✉️", title: "Invite", description: "Hosting Rev. Isaac or Rev. Mrs. Edith for a crusade, conference, or convention? Reach out via the Contact page." },
      ],
    },
  },
  {
    id: "cta-missions",
    type: "ctaBand",
    order: 4,
    content: {
      headline: "Ready to partner with the mission?",
      description: "Pray, give, share, or invite — every act of partnership counts.",
      buttonLabel: "Get in Touch",
      buttonLink: "/contact",
    },
  },
];

export default async function MissionsPage() {
  const dbPage = await prisma.page.findUnique({
    where: { slug: "missions" },
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
