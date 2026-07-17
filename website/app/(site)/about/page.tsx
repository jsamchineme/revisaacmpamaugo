import { SectionRenderer } from "@/components/shared";

export const metadata = {
  title: "Our Story | Rev. Isaac Mpamaugo & Rev. Mrs. Edith Mpamaugo",
  description: "The life and shared ministry of Rev. Isaac Mpamaugo and his wife Rev. Mrs. Edith Mpamaugo.",
};

const aboutSections = [
  {
    id: "pagehero-about",
    type: "pageHero",
    order: 1,
    content: {
      eyebrow: "About",
      headline: "Our Story",
      subtitle: "A lifetime of faithful service to the Gospel of Jesus Christ.",
    },
  },
  {
    id: "text-about",
    type: "textContent",
    order: 2,
    content: {
      body: `
        <p class="lead text-lg text-muted mb-6">Rev. Isaac Mpamaugo's life has been marked by one steady conviction: that the Gospel changes everything.</p>
        <p class="text-muted mb-4">He came to faith as a young man and soon after sensed God's unmistakable call to serve. Over the decades that followed he pastored churches, planted and strengthened congregations, and preached across Nigeria, Africa, and many other nations, walking with his people through joys and trials alike.</p>
        <p class="text-muted mb-4">His leadership reached well beyond his own pulpit. He served as District Superintendent of the Assemblies of God, Lagos District, and became the first Chairman of the Pentecostal Fellowship of Nigeria (PFN) in Lagos, helping to unite churches across the city during the formative years of 1986 to 1990.</p>
        <p class="text-muted mb-4">None of it was done alone. He and his wife Rev. Mrs. (Dr.) Edith Mpamaugo have shared this calling for over 50 years — she is the co-founder and convener of the Life Support Foundation, which since 1996 has cared for vulnerable widows in Lagos, providing free medical outreach, food, and financial empowerment to well over 1,500 widows every year. Together they built a ministry defined less by titles than by faithfulness: showing up, praying long, and loving people through every season.</p>
        <p class="text-muted">Now retired from full-time pastoral duties, Rev. Isaac continues to teach, mentor, and preach when invited. This site is where the sermons and lessons of a lifetime are kept — not as a museum, but as a living well anyone can draw from.</p>
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
        { icon: "♾️", title: "Always Reaching", description: "Retirement changed the schedule, not the calling." },
      ],
    },
  },
];

export default function AboutPage() {
  return <SectionRenderer sections={aboutSections} />;
}
