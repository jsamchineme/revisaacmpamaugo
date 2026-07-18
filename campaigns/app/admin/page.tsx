import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

async function getStats() {
  const [
    totalCampaigns,
    totalContacts,
    totalSent,
    totalEvents,
    recentCampaigns,
  ] = await Promise.all([
    prisma.campaign.count(),
    prisma.contact.count(),
    prisma.sendLog.count(),
    prisma.event.count(),
    prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    }),
  ]);

  return { totalCampaigns, totalContacts, totalSent, totalEvents, recentCampaigns };
}

const STAT_CARDS = [
  {
    key: "totalCampaigns" as const,
    label: "Total Campaigns",
    href: "/admin/campaigns",
    color: "bg-burgundy",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
  {
    key: "totalContacts" as const,
    label: "Total Contacts",
    href: "/admin/contacts",
    color: "bg-gold",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    key: "totalSent" as const,
    label: "Messages Sent",
    href: "/admin/campaigns",
    color: "bg-gold-dark",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    key: "totalEvents" as const,
    label: "Total Events",
    href: "/admin/events",
    color: "bg-burgundy-dark",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
];

type Stats = Awaited<ReturnType<typeof getStats>>;

export default async function AdminDashboardPage() {
  const session = await auth();
  const stats = await getStats();

  const isDbEmpty =
    stats.totalCampaigns === 0 &&
    stats.totalContacts === 0 &&
    stats.totalSent === 0 &&
    stats.totalEvents === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">
          Welcome back, {session?.user?.name?.split(" ")[0] ?? "Admin"}
        </h1>
        <p className="text-muted mt-1">
          Here&apos;s an overview of your campaigns.
        </p>
      </div>

      {/* Stat Cards */}
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
                  {stats[card.key]}
                </p>
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

      {isDbEmpty ? (
        /* ── Empty State ── */
        <div className="bg-white rounded-xl border border-line p-12 text-center">
          <svg
            className="w-12 h-12 text-muted mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">
            Get Started
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            Start by creating a campaign, importing contacts, or setting up an
            event.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/campaigns/new"
              className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
            >
              + New Campaign
            </Link>
            <Link
              href="/admin/contacts"
              className="px-5 py-2.5 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition-colors"
            >
              Import Contacts
            </Link>
            <Link
              href="/admin/events/new"
              className="px-5 py-2.5 border border-line text-ink rounded-lg text-sm font-medium hover:bg-cream transition-colors"
            >
              + New Event
            </Link>
            <Link
              href="/admin/settings"
              className="px-5 py-2.5 border border-line text-ink rounded-lg text-sm font-medium hover:bg-cream transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Recent Campaigns ── */}
          <div className="bg-white rounded-xl border border-line overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <h2 className="font-semibold text-ink">Recent Campaigns</h2>
              <Link
                href="/admin/campaigns"
                className="text-sm text-gold-dark hover:text-gold transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="divide-y divide-line">
              {stats.recentCampaigns.length === 0 ? (
                <p className="px-5 py-8 text-center text-muted text-sm">
                  No campaigns yet.
                </p>
              ) : (
                stats.recentCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/admin/campaigns/${campaign.id}`}
                    className="px-5 py-3 flex items-center justify-between hover:bg-cream/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {campaign.title}
                      </p>
                      <p className="text-xs text-muted">
                        Created {formatDate(campaign.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="bg-white rounded-xl border border-line p-5">
            <h2 className="font-semibold text-ink mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/campaigns/new"
                className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
              >
                + New Campaign
              </Link>
              <Link
                href="/admin/contacts"
                className="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition-colors"
              >
                Import Contacts
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
                Settings
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
