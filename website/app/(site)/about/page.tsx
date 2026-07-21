import { SectionRenderer } from "@/components/shared";

export const metadata = {
  title: "Our Story | Rev. Isaac Mpamaugo & Rev. Mrs. Edith Mpamaugo",
  description: "The life and shared ministry of Rev. Isaac Mpamaugo and his co-ministry partner Rev. Mrs. Edith Mpamaugo.",
};

const aboutSections = [
  {
    id: "pagehero-about",
    type: "pageHero",
    order: 1,
    content: {
      eyebrow: "About",
      headline: "Their Story",
      subtitle: "Rev. Isaac and Rev. Mrs. Edith Mpamaugo — a lifetime of faithful service to the Gospel of Jesus Christ.",
    },
  },
  {
    id: "text-about",
    type: "textContent",
    order: 2,
    content: {
      body: `
        <p class="lead text-lg text-muted mb-6">Rev. Isaac and Rev. Mrs. Edith Mpamaugo have shared one conviction for over 50 years: that the Gospel changes everything — and that a life given to proclaiming it is a life well spent.</p>
        <p class="text-muted mb-4">He came to faith as a young man and soon after sensed God's unmistakable call to serve. Over the decades that followed he pastored churches, planted and strengthened congregations, and preached across Nigeria, Africa, and many other nations, walking with his people through joys and trials alike.</p>
        <p class="text-muted mb-4">His leadership reached well beyond his own pulpit. He served as District Superintendent of the Assemblies of God, Lagos District, and became the first Chairman of the Pentecostal Fellowship of Nigeria (PFN) in Lagos, helping to unite churches across the city during the formative years of 1986 to 1990.</p>
        <p class="text-muted mb-4">None of it was done alone. Rev. Mrs. (Dr.) Edith Mpamaugo has been his co-ministry partner from the beginning — standing alongside him in the pulpit, the home, and the community. She is the co-founder and convener of the Life Support Foundation, which since 1996 has cared for vulnerable widows in Lagos, providing free medical outreach, food, and financial empowerment to well over 1,500 widows every year. Together, Rev. Isaac and Rev. Mrs. Edith built a ministry defined less by titles than by faithfulness: showing up, praying long, and loving people through every season.</p>
        <p class="text-muted">Rev. Isaac continues to teach, mentor, and preach — and Rev. Mrs. Edith continues her work with the Life Support Foundation and her own ministry to women and families. This site is where the sermons and lessons of a lifetime are kept — not as a museum, but as a living well anyone can draw from, wherever they are in the world.</p>
      `,
    },
  },
  {
    id: "mission-vision",
    type: "missionVision",
    order: 3,
    content: {
      missionTitle: "Our Mission",
      missionBody: "To proclaim the Gospel of Jesus Christ plainly and faithfully, to teach the Scriptures so they take root in everyday life, and to encourage every believer to walk closely with God — for as long as the Lord gives us breath.",
      visionTitle: "What We Believe",
      visionBody: "We hold to the historic Christian faith in the Pentecostal tradition: the authority of Scripture, salvation by grace through faith in Jesus Christ, the present work and gifts of the Holy Spirit, and the call to love God and neighbor.",
    },
  },
  {
    id: "features-about",
    type: "featuresGrid",
    order: 4,
    content: {
      eyebrow: "What makes this ministry different",
      title: "Faithfulness, not flash",
      features: [
        { icon: "🕯️", title: "Depth Over Noise", description: "Decades of seasoned, scripture-rooted preaching — not trends." },
        { icon: "💍", title: "A Shared Witness", description: "A husband-and-wife ministry that models faith at home, not only from the pulpit." },
        { icon: "♾️", title: "Always Reaching", description: "Active in ministry — preaching, teaching, and serving wherever the Lord opens doors." },
      ],
    },
  },
];

export default function AboutPage() {
  return <SectionRenderer sections={aboutSections} />;
}
