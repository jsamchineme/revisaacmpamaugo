import { SectionRenderer } from "@/components/shared";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ministries | Rev. Isaac & Rev. Mrs. Edith Mpamaugo",
  description:
    "How Rev. Isaac and Rev. Mrs. Edith Mpamaugo serve — preaching, Bible teaching, women's ministry, the Life Support Foundation, missions, and more.",
};

const defaultSections = [
  {
    id: "pagehero-ministries",
    type: "pageHero",
    order: 1,
    content: {
      eyebrow: "Ministries",
      headline: "How Rev. Isaac & Rev. Mrs. Edith Serve",
      subtitle:
        "A lifetime of ministry takes many forms. Here are the ways Rev. Isaac and his co-ministry partner Rev. Mrs. Edith Mpamaugo continue to serve the church, the community, and individual believers today.",
    },
  },
  {
    id: "grid-his-ministry",
    type: "grid",
    order: 2,
    content: {
      eyebrow: "Rev. Isaac Mpamaugo",
      title: "His Ministry",
      items: [
        { icon: "🎙️", title: "Preaching", description: "Gospel-centered messages for Sundays, conferences, conventions, and special gatherings — Rev. Isaac's hallmark for over five decades." },
        { icon: "📖", title: "Bible Teaching", description: "Verse-by-verse and topical teaching that makes Scripture clear and applicable to everyday life." },
        { icon: "🌱", title: "Mentoring Ministers", description: "Rev. Isaac invests in younger pastors and church leaders, sharing hard-won wisdom from a lifetime of pastoral ministry." },
      ],
    },
  },
  {
    id: "grid-her-ministry",
    type: "grid",
    order: 3,
    content: {
      eyebrow: "Rev. Mrs. Edith Mpamaugo",
      title: "Her Ministry",
      items: [
        { icon: "❤️", title: "Life Support Foundation", description: "Co-founder and convener of the Life Support Foundation — since 1996 providing medical outreach, food, and empowerment to over 1,500 vulnerable widows in Lagos each year." },
        { icon: "👩‍👧", title: "Ministry to Women & Families", description: "Rev. Mrs. Edith brings decades of wisdom to women's ministry, family life, and pastoral care — a gifted minister in her own right." },
        { icon: "🙏", title: "Prayer & Pastoral Care", description: "A faithful intercessor and counsellor — Rev. Mrs. Edith carries the burdens of God's people with compassion and faith." },
      ],
    },
  },
  {
    id: "grid-shared-ministry",
    type: "grid",
    order: 4,
    content: {
      eyebrow: "Together",
      title: "Their Shared Ministry",
      items: [
        { icon: "💍", title: "Marriage & Family", description: "Wisdom from over 50 years of marriage and ministry — Rev. Isaac and Rev. Mrs. Edith minister together to couples and families." },
        { icon: "✈️", title: "Missions", description: "A heart for the nations: Rev. Isaac and Rev. Mrs. Edith have carried the Gospel across Nigeria, Africa, and beyond." },
        { icon: "⚓", title: "A Lifetime of Faithfulness", description: "Fifty years of standing together — in the pulpit, in the home, in the community. Two callings, one purpose." },
      ],
    },
  },
  {
    id: "steps-ministries",
    type: "steps",
    order: 5,
    content: {
      eyebrow: "Invite Them",
      title: "How to Invite Rev. Isaac or Rev. Mrs. Edith",
      steps: [
        { title: "Reach Out", description: "Send a message through the Contact page with your event, occasion, or need." },
        { title: "We Talk It Through", description: "Dates, theme, audience, and how Rev. Isaac or Rev. Mrs. Edith can best serve your gathering." },
        { title: "They Minister", description: "In person where possible, or by recorded message where not." },
      ],
    },
  },
  {
    id: "faq-ministries",
    type: "faq",
    order: 6,
    content: {
      background: "white",
      eyebrow: "Questions",
      title: "Frequently Asked",
      items: [
        { question: "Are Rev. Isaac or Rev. Mrs. Edith available to preach or speak at events?", answer: "Yes, as their schedule allows. Use the Contact page to share the date, location, and occasion, and we'll respond." },
        { question: "Can I request prayer?", answer: "Absolutely. Send your request through the Contact form. Every request is read and prayed over." },
        { question: "Are the sermons free to share?", answer: "Yes. You're welcome to share them with anyone who would be encouraged by them." },
        { question: "Does Rev. Isaac offer counselling or pastoral advice?", answer: "Rev. Isaac offers prayer and spiritual encouragement. For ongoing pastoral or professional counselling, he's glad to point you to trusted resources." },
        { question: "How can I support the ministry?", answer: "Your prayers and your sharing of these messages are a real encouragement. To give financially, visit the Give page. To partner with the widows' outreach of the Life Support Foundation, mention it in your message." },
      ],
      bottomCtaLabel: "Have something on your heart?",
      bottomCtaLink: "/contact",
    },
  },
];

export default async function MinistriesPage() {
  const dbPage = await prisma.page.findUnique({
    where: { slug: "ministries" },
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
