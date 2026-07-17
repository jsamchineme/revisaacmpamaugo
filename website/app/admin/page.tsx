import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    sermonCount,
    teachingCount,
    eventCount,
    unreadMessageCount,
    publishedSermons,
    publishedTeachings,
    publishedEvents,
    recentMessages,
    recentSermons,
  ] = await Promise.all([
    prisma.sermon.count(),
    prisma.teaching.count(),
    prisma.event.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.sermon.count({ where: { published: true } }),
    prisma.teaching.count({ where: { published: true } }),
    prisma.event.count({ where: { published: true } }),
    prisma.contactMessage.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sermon.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        published: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    sermonCount,
    teachingCount,
    eventCount,
    unreadMessageCount,
    publishedSermons,
    publishedTeachings,
    publishedEvents,
    recentMessages,
    recentSermons,
  };
}

const STAT_CARDS = [
  {
    key: "sermonCount",
    label: "Total Sermons",
    subKey: "publishedSermons",
    subLabel: "published",
    href: "/admin/sermons",
    color: "bg-burgundy",
    icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4a1 1 0 001 1h3m-4-5a7 7 0 01-7-7V5a1 1 0 011-1h3m4 0a7 7 0 017 7v1m-8-8h.01",
  },
  {
    key: "teachingCount",
    label: "Total Teachings",
    subKey: "publishedTeachings",
    subLabel: "published",
    href: "/admin/teachings",
    color: "bg-gold",
    icon: "M12 6.253v13m0-13C10.138 5.047 7.846 4.75 5.5 4.75c-1.5 0-2.5.5-2.5 2v11c0 1.5 1 2 2.5 2 2.346 0 4.638.297 6.5 1.503m0-13C13.862 5.047 16.154 4.75 18.5 4.75c1.5 0 2.5.5 2.5 2v11c0 1.5-1 2-2.5 2-2.346 0-4.638.297-6.5 1.503",
  },
  {
    key: "eventCount",
    label: "Total Events",
    subKey: "publishedEvents",
    subLabel: "published",
    href: "/admin/events",
    color: "bg-gold-dark",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    key: "unreadMessageCount",
    label: "Unread Messages",
    subKey: null,
    subLabel: null,
    href: "/admin/messages",
    color: "bg-burgundy-dark",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Admin"}
        </h1>
        <p className="text-muted mt-1">
          Here&apos;s an overview of your ministry website.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-white rounded-xl border border-line p-5 hover:shadow-card transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">{card.label}</p>
                <p className="font-serif text-3xl font-bold text-ink mt-2">
                  {(stats as any)[card.key]}
                </p>
                {card.subKey && card.subLabel && (
                  <p className="text-xs text-muted mt-1">
                    {(stats as any)[card.subKey]} {card.subLabel}
                  </p>
                )}
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${card.color} text-white group-hover:scale-105 transition-transform`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={card.icon}
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-line overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="font-semibold text-ink">Recent Sermons</h2>
            <Link
              href="/admin/sermons"
              className="text-sm text-gold-dark hover:text-gold transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {stats.recentSermons.length === 0 ? (
              <p className="px-5 py-8 text-center text-muted text-sm">
                No sermons yet.
              </p>
            ) : (
              stats.recentSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-cream/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {sermon.title}
                    </p>
                    <p className="text-xs text-muted">
                      {sermon.category || "Uncategorized"} ·{" "}
                      {formatDate(sermon.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-3 ${
                      sermon.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {sermon.published ? "Published" : "Draft"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-line overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <h2 className="font-semibold text-ink">Recent Messages</h2>
            <Link
              href="/admin/messages"
              className="text-sm text-gold-dark hover:text-gold transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {stats.recentMessages.length === 0 ? (
              <p className="px-5 py-8 text-center text-muted text-sm">
                No messages yet.
              </p>
            ) : (
              stats.recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-cream/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {msg.name}
                    </p>
                    <p className="text-xs text-muted truncate">{msg.email}</p>
                  </div>
                  {!msg.read && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-burgundy text-white flex-shrink-0 ml-3">
                      New
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-line p-5">
        <h2 className="font-semibold text-ink mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/sermons/new"
            className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
          >
            + New Sermon
          </Link>
          <Link
            href="/admin/teachings/new"
            className="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition-colors"
          >
            + New Teaching
          </Link>
          <Link
            href="/admin/events/new"
            className="px-4 py-2 border border-line text-ink rounded-lg text-sm font-medium hover:bg-cream transition-colors"
          >
            + New Event
          </Link>
          <Link
            href="/admin/settings"
            className="px-4 py-2 border border-line text-ink rounded-lg text-sm font-medium hover:bg-cream transition-colors"
          >
            Site Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
