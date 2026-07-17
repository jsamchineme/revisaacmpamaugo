import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const filename = connectionString.replace(/^file:/, "");
const adapter = new PrismaBetterSqlite3({ url: filename });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "changeme123",
    12
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@isaacmpamaugo.org" },
    update: {},
    create: {
      name: "Rev. Isaac Mpamaugo",
      email: process.env.ADMIN_EMAIL ?? "admin@isaacmpamaugo.org",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin user: ${admin.email}`);

  // ─── Pages ──────────────────────────────────────────────────────────────────

  const pages = [
    {
      slug: "home",
      title: "Home",
      metaDescription:
        "Rev. Isaac Mpamaugo | Sermons, Teachings & Ministry — A retired Rev. sharing a lifetime of sermons and Bible teaching.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "hero",
          order: 0,
          content: {
            headline: "Faithful Service. Timeless Truth.",
            subheadline:
              "For over 50 years, Rev. Isaac Mpamaugo has preached the Gospel and shepherded God\u2019s people. Today he and his wife Rev. Edith Mpamaugo share a lifetime of sermons and teaching with all who are seeking.",
            buttons: [
              { label: "Listen to a Sermon", href: "/sermons", variant: "gold" },
              { label: "Get weekly teachings", href: "/teachings", variant: "ghost" },
            ],
          },
        },
        {
          id: "sec-trust",
          type: "trustStrip",
          order: 1,
          content: {
            stats: [
              { number: "50+", label: "Years in Ministry" },
              { number: "200+", label: "Congregations Served" },
              { number: "Hundreds", label: "Sermons & Teachings" },
              { number: "50+", label: "Years Together in Ministry" },
            ],
          },
        },
        {
          id: "sec-features",
          type: "featuresGrid",
          order: 2,
          content: {
            title: "A Lifetime of Faithfulness",
            subtitle: "Decades of faithful ministry, gathered in one place.",
            features: [
              {
                icon: "book",
                title: "Sermons That Endure",
                description:
                  "Decades of preaching, gathered in one place to encourage your faith whenever you need it.",
              },
              {
                icon: "lamp",
                title: "Teaching Rooted in Scripture",
                description:
                  "Clear, practical Bible teaching for everyday Christian living, marriage, and family.",
              },
              {
                icon: "heart",
                title: "A Shared Calling",
                description:
                  "The fruit of a lifetime of ministry by Rev. Isaac and his wife Rev. Mrs. Edith Mpamaugo, side by side.",
              },
            ],
          },
        },
        {
          id: "sec-about-preview",
          type: "aboutPreview",
          order: 3,
          content: {
            headline: "A Life Given to the Gospel",
            body: "Rev. Isaac Mpamaugo answered the call to ministry as a young man and has spent his life pointing people to Christ. Alongside his wife Rev. Mrs. Edith Mpamaugo, he has pastored, taught, counseled, and prayed with countless families. Though now retired from the pulpit, his calling has never stopped — it simply found a new way to reach you.",
            ctaLabel: "Read Their Story",
            ctaLink: "/about",
          },
        },
        {
          id: "sec-sermons-preview",
          type: "sermonsPreview",
          order: 4,
          content: {
            title: "Recent Sermons & Teachings",
            subtitle: "Messages of hope, faith, and the steadfast love of God.",
            count: 3,
          },
        },
        {
          id: "sec-events-preview",
          type: "eventsPreview",
          order: 5,
          content: {
            title: "Outreach & Events",
            subtitle:
              "Where the ministry is at work — past gatherings, evangelism, and care for the community.",
            count: 3,
          },
        },
        {
          id: "sec-testimonials",
          type: "testimonials",
          order: 6,
          content: {
            title: "What People Say",
            testimonialIds: [],
          },
        },
        {
          id: "sec-cta",
          type: "ctaBand",
          order: 7,
          content: {
            headline: "However far the road, grace reaches further.",
            description:
              "Reach out for prayer, an encouraging word, or to invite Rev. Isaac to minister.",
            buttonLabel: "Get in Touch",
            buttonLink: "/contact",
          },
        },
      ]),
    },
    {
      slug: "about",
      title: "About",
      metaDescription:
        "Our Story | Rev. Isaac Mpamaugo & Rev. Mrs. Edith Mpamaugo — The life and shared ministry of Rev. Isaac Mpamaugo and his wife.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: { headline: "Our Story", subtitle: "" },
        },
        {
          id: "sec-text",
          type: "textContent",
          order: 1,
          content: {
            body: `<p>Rev. Isaac Mpamaugo's life has been marked by one steady conviction: that the Gospel changes everything. He came to faith as a young man and soon after sensed God's unmistakable call to serve. Over the decades that followed he pastored churches, planted and strengthened congregations, and preached across Nigeria, Africa, and many other nations, walking with his people through joys and trials alike.</p><p>His leadership reached well beyond his own pulpit. He served as District Superintendent of the Assemblies of God, Lagos District, and became the first Chairman of the Pentecostal Fellowship of Nigeria (PFN) in Lagos, helping to unite churches across the city during the formative years of 1986 to 1990.</p><p>None of it was done alone. He and his wife Rev. Mrs. (Dr.) Edith Mpamaugo have shared this calling for over 50 years — she is the co-founder and convener of the Life Support Foundation, which since 1996 has cared for vulnerable widows in Lagos, providing free medical outreach, food, and financial empowerment to well over 1,500 widows every year. Together they built a ministry defined less by titles than by faithfulness: showing up, praying long, and loving people through every season.</p><p>Now retired from full-time pastoral duties, Rev. Isaac continues to teach, mentor, and preach when invited. This site is where the sermons and lessons of a lifetime are kept — not as a museum, but as a living well anyone can draw from.</p>`,
          },
        },
        {
          id: "sec-mission",
          type: "missionVision",
          order: 2,
          content: {
            missionTitle: "Our Mission",
            missionBody:
              "To proclaim the Gospel of Jesus Christ plainly and faithfully, to teach the Scriptures so they take root in everyday life, and to encourage every believer to walk closely with God — for as long as the Lord gives us breath.",
            visionTitle: "What We Believe",
            visionBody:
              "We hold to the historic Christian faith in the Pentecostal tradition: the authority of Scripture, salvation by grace through faith in Jesus Christ, the present work and gifts of the Holy Spirit, and the call to love God and neighbor.",
          },
        },
        {
          id: "sec-features",
          type: "featuresGrid",
          order: 3,
          content: {
            title: "Faithfulness, Not Flash",
            subtitle: "What makes this ministry different.",
            features: [
              {
                icon: "depth",
                title: "Depth Over Noise",
                description:
                  "Decades of seasoned, scripture-rooted preaching — not trends.",
              },
              {
                icon: "users",
                title: "A Shared Witness",
                description:
                  "A husband-and-wife ministry that models faith at home, not only from the pulpit.",
              },
              {
                icon: "compass",
                title: "Always Reaching",
                description:
                  "Retirement changed the schedule, not the calling.",
              },
            ],
          },
        },
      ]),
    },
    {
      slug: "ministry",
      title: "Ministry",
      metaDescription:
        "Ministry & Invitations | Rev. Isaac Mpamaugo — Preaching, Bible teaching, prayer, and marriage & family ministry.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "How Rev. Isaac Serves",
            subtitle:
              "A lifetime of ministry takes many forms. Here are the ways Rev. Isaac continues to serve the church and individual believers today.",
          },
        },
        {
          id: "sec-grid",
          type: "grid",
          order: 1,
          content: {
            items: [
              {
                icon: "cross",
                title: "Preaching",
                description:
                  "Gospel-centered messages for Sundays, conferences, conventions, and special gatherings.",
              },
              {
                icon: "book",
                title: "Bible Teaching",
                description:
                  "Verse-by-verse and topical teaching that makes Scripture clear and applicable.",
              },
              {
                icon: "pray",
                title: "Pastoral Care & Prayer",
                description:
                  "A listening ear, counsel, and faithful prayer for those facing difficulty.",
              },
              {
                icon: "heart",
                title: "Marriage & Family Ministry",
                description:
                  "Wisdom from over 45 years of marriage and ministry, offered with his wife Rev. Mrs. Edith Mpamaugo.",
              },
              {
                icon: "users",
                title: "Mentoring Ministers",
                description:
                  "Encouraging and guiding younger pastors and church leaders.",
              },
              {
                icon: "hands",
                title: "Widows & Community Outreach",
                description:
                  "Through the Life Support Foundation, caring for vulnerable widows in Lagos with free medical outreach, food, and financial empowerment.",
              },
            ],
          },
        },
        {
          id: "sec-steps",
          type: "steps",
          order: 2,
          content: {
            title: "How to Invite Rev. Isaac",
            subtitle:
              "Inviting Rev. Isaac to minister at your event is simple.",
            steps: [
              {
                title: "Reach Out",
                description:
                  "Send a message through the Contact page with your event or need.",
              },
              {
                title: "We Talk It Through",
                description:
                  "Dates, theme, audience, and how he can best serve.",
              },
              {
                title: "He Ministers",
                description:
                  "In person where possible, or by recorded message where not.",
              },
            ],
          },
        },
        {
          id: "sec-faq",
          type: "faq",
          order: 3,
          content: {
            title: "Frequently Asked Questions",
            items: [
              {
                question:
                  "Is Rev. Isaac available to preach or speak at events?",
                answer:
                  "Yes, as his schedule allows. Use the Contact page to share the date, location, and occasion, and we'll respond.",
              },
              {
                question: "Can I request prayer?",
                answer:
                  "Absolutely. Send your request through the Contact form. Every request is read and prayed over.",
              },
              {
                question: "Are the sermons free to share?",
                answer:
                  "Yes. You're welcome to share them with anyone who would be encouraged by them.",
              },
              {
                question:
                  "Does he offer counseling or pastoral advice?",
                answer:
                  "He offers prayer and spiritual encouragement. For ongoing pastoral or professional counseling, he's glad to point you to trusted resources.",
              },
              {
                question: "How can I support the ministry?",
                answer:
                  "Your prayers and your sharing of these messages are a real encouragement. If you'd like to partner with the widows' outreach of the Life Support Foundation, mention it in your message and we'll be glad to share how.",
              },
            ],
          },
        },
      ]),
    },
    {
      slug: "sermons",
      title: "Sermons",
      metaDescription:
        "Sermons & Teachings | Rev. Isaac Mpamaugo — Browse sermons and Bible teachings on faith, family, Scripture, and prayer.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "Sermons & Teachings",
            subtitle:
              "Messages preached and lessons taught over a lifetime of ministry — on faith, family, Scripture, and the faithfulness of God.",
          },
        },
      ]),
    },
    {
      slug: "events",
      title: "Events",
      metaDescription:
        "Events & Outreach | Rev. Isaac Mpamaugo — Evangelistic gatherings, crusades, conferences, and outreach to widows.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "Events & Outreach",
            subtitle:
              "A look at the ministry in action — evangelistic gatherings, outreach to the vulnerable, and moments of faith and fellowship.",
          },
        },
      ]),
    },
    {
      slug: "contact",
      title: "Contact",
      metaDescription:
        "Contact | Reverend Isaac Mpamaugo — Request prayer, ask a question, or invite Rev. Isaac to minister.",
      sections: JSON.stringify([
        {
          id: "sec-hero",
          type: "pageHero",
          order: 0,
          content: {
            headline: "Get in Touch",
            subtitle:
              "Whether you'd like prayer, an encouraging word, or to invite Rev. Isaac to minister, we'd love to hear from you.",
          },
        },
        {
          id: "sec-form",
          type: "contactForm",
          order: 1,
          content: {},
        },
        {
          id: "sec-info",
          type: "contactInfo",
          order: 2,
          content: {},
        },
      ]),
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: { sections: page.sections },
      create: page as any,
    });
    console.log(`  ✓ Page: ${page.slug}`);
  }

  // ─── Sermons ────────────────────────────────────────────────────────────────

  const sermons = [
    {
      slug: "the-anchor-that-holds",
      title: "The Anchor That Holds",
      description: "Where to stand when life shakes everything you trusted.",
      category: "Faith & Hope",
      scriptureRef: "Hebrews 6:19",
      published: true,
    },
    {
      slug: "a-house-built-on-the-rock",
      title: "A House Built on the Rock",
      description: "Building a marriage and home that endure.",
      category: "Family & Marriage",
      scriptureRef: "Matthew 7:24–27",
      published: true,
    },
    {
      slug: "be-still-and-know",
      title: "Be Still and Know",
      description: "Learning to rest in the sovereignty of God.",
      category: "Prayer",
      scriptureRef: "Psalm 46:10",
      published: true,
    },
    {
      slug: "the-god-who-keeps-his-word",
      title: "The God Who Keeps His Word",
      description: "Tracing God's faithfulness through Scripture.",
      category: "Scripture",
      scriptureRef: "Joshua 21:45",
      published: true,
    },
    {
      slug: "grace-greater-than-our-sin",
      title: "Grace Greater Than Our Sin",
      description: "The heart of the Gospel, plainly told.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:20",
      published: true,
    },
    {
      slug: "walking-the-long-road",
      title: "Walking the Long Road",
      description: "Faithfulness over a lifetime, not just a moment.",
      category: "The Christian Life",
      scriptureRef: "Galatians 6:9",
      published: true,
    },
    {
      slug: "when-you-pray",
      title: "When You Pray",
      description: "A teaching on prayer that is honest and unhurried.",
      category: "Prayer",
      scriptureRef: "Matthew 6:6–9",
      published: true,
    },
    {
      slug: "honoring-one-another",
      title: "Honoring One Another",
      description: "Love and respect in the Christian home.",
      category: "Family & Marriage",
      scriptureRef: "Romans 12:10",
      published: true,
    },
    {
      slug: "hope-that-does-not-disappoint",
      title: "Hope That Does Not Disappoint",
      description: "Why the Christian's hope is secure.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:3–5",
      published: true,
    },
  ];

  for (const sermon of sermons) {
    await prisma.sermon.upsert({
      where: { slug: sermon.slug },
      update: {},
      create: { ...sermon, slug: sermon.slug },
    });
  }
  console.log(`  ✓ ${sermons.length} sermons`);

  // ─── Teachings ──────────────────────────────────────────────────────────────

  const teachings = [
    {
      slug: "teaching-anchor-that-holds",
      title: "The Anchor That Holds",
      excerpt:
        "When the storms of life pull hard against you, hope in Christ is the anchor that does not drag.",
      category: "Faith & Hope",
      scriptureRef: "Hebrews 6:19",
      published: true,
    },
    {
      slug: "teaching-house-built-on-rock",
      title: "A House Built on the Rock",
      excerpt:
        "Two houses, one storm, two very different endings — and the difference was never the storm. It was the foundation.",
      category: "Family & Marriage",
      scriptureRef: "Matthew 7:24–27",
      published: true,
    },
    {
      slug: "teaching-be-still-and-know",
      title: "Be Still and Know",
      excerpt:
        "In a world that will not stop moving, God calls us to a stillness that is not weakness but trust.",
      category: "Prayer",
      scriptureRef: "Psalm 46:10",
      published: true,
    },
    {
      slug: "teaching-god-who-keeps-his-word",
      title: "The God Who Keeps His Word",
      excerpt:
        "Trace the long story of Scripture and you find one unbroken thread: God keeps His word.",
      category: "Scripture",
      scriptureRef: "Joshua 21:45",
      published: true,
    },
    {
      slug: "teaching-grace-greater-than-sin",
      title: "Grace Greater Than Our Sin",
      excerpt:
        "There is no pit so deep that the grace of God in Christ cannot reach to the bottom of it.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:20",
      published: true,
    },
    {
      slug: "teaching-walking-long-road",
      title: "Walking the Long Road",
      excerpt:
        "The Christian life is not a sprint but a long faithfulness — and the harvest belongs to those who do not give up.",
      category: "The Christian Life",
      scriptureRef: "Galatians 6:9",
      published: true,
    },
    {
      slug: "teaching-when-you-pray",
      title: "When You Pray",
      excerpt:
        "Jesus does not say \"if you pray\" but \"when\" — and then He teaches us to speak to God as a Father.",
      category: "Prayer",
      scriptureRef: "Matthew 6:6–9",
      published: true,
    },
    {
      slug: "teaching-honoring-one-another",
      title: "Honoring One Another",
      excerpt:
        "A home, a marriage, and a church are all built or broken on one small, costly habit — honoring one another.",
      category: "Family & Marriage",
      scriptureRef: "Romans 12:10",
      published: true,
    },
    {
      slug: "teaching-hope-that-does-not-disappoint",
      title: "Hope That Does Not Disappoint",
      excerpt:
        "The world's hopes can disappoint us, but the hope God gives is tested in suffering and never fails.",
      category: "Faith & Hope",
      scriptureRef: "Romans 5:3–5",
      published: true,
    },
    {
      slug: "teaching-fruit-of-the-spirit",
      title: "The Fruit of the Spirit",
      excerpt:
        "The character of Christ formed in us is the surest evidence of the Spirit's work in our lives.",
      category: "The Christian Life",
      scriptureRef: "Galatians 5:22–23",
      published: true,
    },
  ];

  for (const teaching of teachings) {
    await prisma.teaching.upsert({
      where: { slug: teaching.slug },
      update: {},
      create: teaching,
    });
  }
  console.log(`  ✓ ${teachings.length} teachings`);

  // ─── Events ─────────────────────────────────────────────────────────────────

  const events = [
    {
      slug: "christmas-widows-outreach",
      title: "Christmas Widows Outreach Brings Hope to Over 1,500 Widows in Lagos",
      excerpt:
        "More than 1,500 widows were welcomed for a day of care, dignity, and hope.",
      category: "Outreach",
      date: "2025-12-20",
      published: true,
    },
    {
      slug: "gospel-crusade",
      title: "Gospel Crusade Draws the Community Together in Faith",
      excerpt:
        "An evening of worship, preaching, and prayer that drew families from across the area.",
      category: "Crusade",
      date: "2025-10-15",
      published: true,
    },
    {
      slug: "marriage-family-conference",
      title: "Marriage & Family Conference Strengthens Homes in the Faith",
      excerpt:
        "Rev. Isaac and Rev. Mrs. Edith Mpamaugo shared decades of wisdom with couples and families.",
      category: "Conferences",
      date: "2025-08-22",
      published: true,
    },
    {
      slug: "street-evangelism-outreach",
      title: "Street Evangelism Outreach Shares Hope Door to Door",
      excerpt:
        "Volunteers went into the community to pray with and encourage neighbors.",
      category: "Evangelism",
      date: "2025-06-10",
      published: true,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    });
  }
  console.log(`  ✓ ${events.length} events`);

  // ─── Testimonials ───────────────────────────────────────────────────────────

  const testimonials = [
    {
      quote:
        "Rev. Mpamaugo's preaching carried our family through our hardest years. His words still steady me today.",
      author: "Grace A.",
      role: "Lagos",
      order: 0,
      published: true,
    },
    {
      quote:
        "He and Rev. Mrs. Edith Mpamaugo didn't just teach us about faith — they showed us what a faithful life looks like.",
      author: "Pastor Daniel O.",
      role: "",
      order: 1,
      published: true,
    },
    {
      quote:
        "Every sermon sends you back to the Scriptures and back to your knees. A true shepherd.",
      author: "Mary E.",
      role: "",
      order: 2,
      published: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial });
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  // ─── Settings ───────────────────────────────────────────────────────────────

  const settings = [
    { key: "siteTitle", value: JSON.stringify("The Ministry of Rev. Isaac Mpamaugo") },
    { key: "tagline", value: JSON.stringify("A lifetime of faithful service, sermons, and teaching") },
    { key: "contactEmail", value: JSON.stringify("hello@isaacmpamaugo.org") },
    { key: "contactPhone", value: JSON.stringify("+234 (0)800 000 0000") },
    { key: "contactLocation", value: JSON.stringify("Lagos, Nigeria") },
    {
      key: "socialLinks",
      value: JSON.stringify({
        facebook: "#",
        youtube: "#",
        instagram: "#",
      }),
    },
    { key: "seoDefaults", value: JSON.stringify({ ogImage: "/og-image.jpg" }) },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`  ✓ ${settings.length} settings`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
