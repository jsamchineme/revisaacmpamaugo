import { SectionRenderer } from "@/components/shared";

export const metadata = {
  title: "Ministry & Invitations | Rev. Isaac Mpamaugo",
  description: "Preaching, Bible teaching, prayer, and marriage & family ministry. Invite Rev. Isaac to minister.",
};

const ministrySections = [
  {
    id: "pagehero-ministry",
    type: "pageHero",
    order: 1,
    content: {
      eyebrow: "Ministry",
      headline: "How Rev. Isaac Serves",
      subtitle: "A lifetime of ministry takes many forms. Here are the ways he continues to serve the church and individual believers today.",
    },
  },
  {
    id: "grid-ministry",
    type: "grid",
    order: 2,
    content: {
      items: [
        { icon: "🎙️", title: "Preaching", description: "Gospel-centered messages for Sundays, conferences, conventions, and special gatherings." },
        { icon: "📖", title: "Bible Teaching", description: "Verse-by-verse and topical teaching that makes Scripture clear and applicable." },
        { icon: "🙏", title: "Pastoral Care & Prayer", description: "A listening ear, counsel, and faithful prayer for those facing difficulty." },
        { icon: "💍", title: "Marriage & Family", description: "Wisdom from over 50 years of marriage and ministry, offered with his wife Rev. Mrs. Edith Mpamaugo." },
        { icon: "🌱", title: "Mentoring Ministers", description: "Encouraging and guiding younger pastors and church leaders." },
        { icon: "❤️", title: "Widows & Community Outreach", description: "Through the Life Support Foundation, caring for vulnerable widows in Lagos with free medical outreach, food, and empowerment." },
      ],
    },
  },
  {
    id: "steps-ministry",
    type: "steps",
    order: 3,
    content: {
      eyebrow: "Invite Rev. Isaac",
      title: "How to Invite Him",
      steps: [
        { title: "Reach Out", description: "Send a message through the Contact page with your event or need." },
        { title: "We Talk It Through", description: "Dates, theme, audience, and how he can best serve." },
        { title: "He Ministers", description: "In person where possible, or by recorded message where not." },
      ],
    },
  },
  {
    id: "faq-ministry",
    type: "faq",
    order: 4,
    content: {
      eyebrow: "Questions",
      title: "Frequently Asked",
      items: [
        { question: "Is Rev. Isaac available to preach or speak at events?", answer: "Yes, as his schedule allows. Use the Contact page to share the date, location, and occasion, and we'll respond." },
        { question: "Can I request prayer?", answer: "Absolutely. Send your request through the Contact form. Every request is read and prayed over." },
        { question: "Are the sermons free to share?", answer: "Yes. You're welcome to share them with anyone who would be encouraged by them." },
        { question: "Does he offer counseling or pastoral advice?", answer: "He offers prayer and spiritual encouragement. For ongoing pastoral or professional counseling, he's glad to point you to trusted resources." },
        { question: "How can I support the ministry?", answer: "Your prayers and your sharing of these messages are a real encouragement. If you'd like to partner with the widows' outreach of the Life Support Foundation, mention it in your message and we'll be glad to share how." },
      ],
    },
  },
];

export default function MinistryPage() {
  return <SectionRenderer sections={ministrySections} />;
}
