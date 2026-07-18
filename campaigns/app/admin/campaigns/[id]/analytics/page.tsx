import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReCampaignButton from "@/components/admin/ReCampaignButton";

export const dynamic = "force-dynamic";

export default async function CampaignAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // Auth check — middleware already protects /admin/*, but guard anyway
  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Unauthorized</div>
      </div>
    );
  }

  // Fetch campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    notFound();
  }

  // Fetch all assigned contacts for this campaign
  const campaignContacts = await prisma.campaignContact.findMany({
    where: { campaignId: id },
  });

  const totalSent = campaignContacts.length;

  // Empty state
  if (totalSent === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{campaign.title}</h1>
            <p className="text-muted text-sm">Campaign Analytics</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/campaigns/${id}/send`}
              className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
            >
              Send Campaign
            </Link>
            <Link
              href="/admin/campaigns"
              className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
            >
              Back to Campaigns
            </Link>
          </div>
        </div>

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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">
            No Contacts Assigned
          </h2>
          <p className="text-muted mb-8 max-w-md mx-auto">
            This campaign has no contacts assigned yet. Assign contacts and send
            the campaign to see analytics.
          </p>
          <Link
            href={`/admin/campaigns/${id}/contacts`}
            className="px-5 py-2.5 bg-burgundy text-white rounded-lg text-sm font-medium hover:bg-burgundy-dark transition-colors"
          >
            Assign Contacts
          </Link>
        </div>
      </div>
    );
  }

  // Manual join: fetch contacts and click events separately
  const contactIds = campaignContacts.map((cc) => cc.contactId);
  const campaignContactIds = campaignContacts.map((cc) => cc.id);

  const [contacts, clickEvents] = await Promise.all([
    prisma.contact.findMany({
      where: { id: { in: contactIds } },
    }),
    prisma.clickEvent.findMany({
      where: { campaignContactId: { in: campaignContactIds } },
    }),
  ]);

  // Build lookup maps
  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const clickCountMap = new Map<string, number>();
  for (const ce of clickEvents) {
    clickCountMap.set(
      ce.campaignContactId,
      (clickCountMap.get(ce.campaignContactId) || 0) + 1
    );
  }

  // Merge into rows
  const rows = campaignContacts.map((cc) => ({
    campaignContactId: cc.id,
    contact: contactMap.get(cc.contactId),
    clickCount: clickCountMap.get(cc.id) || 0,
  }));

  const clicked = rows.filter((r) => r.clickCount > 0);
  const notClicked = rows.filter((r) => r.clickCount === 0);

  const uniqueClickers = clicked.length;
  const totalClicks = clickEvents.length;
  const clickRate =
    totalSent > 0 ? Math.round((uniqueClickers / totalSent) * 100) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <p className="text-muted text-sm">Campaign Analytics</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/campaigns/${id}/send`}
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Send Campaign
          </Link>
          <Link
            href="/admin/campaigns"
            className="px-4 py-2 border border-line rounded-lg hover:bg-cream transition-colors text-sm"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-line p-5">
          <p className="text-sm text-muted">Total Sent</p>
          <p className="font-serif text-3xl font-bold text-ink mt-2">
            {totalSent}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-line p-5">
          <p className="text-sm text-muted">Unique Clickers</p>
          <p className="font-serif text-3xl font-bold text-ink mt-2">
            {uniqueClickers}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-line p-5">
          <p className="text-sm text-muted">Total Clicks</p>
          <p className="font-serif text-3xl font-bold text-ink mt-2">
            {totalClicks}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-line p-5">
          <p className="text-sm text-muted">Click Rate</p>
          <p className="font-serif text-3xl font-bold text-ink mt-2">
            {clickRate !== null ? `${clickRate}%` : "N/A"}
          </p>
        </div>
      </div>

      {/* Clicked Table */}
      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-ink">
              Clicked Contacts ({clicked.length})
            </h2>
            {clicked.length > 0 && (
              <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded inline-block mt-1">
                {clicked.length} of {totalSent} clicked
              </span>
            )}
          </div>
          <ReCampaignButton
            contactIds={clicked.map((row) => row.contact?.id).filter(Boolean) as string[]}
            disabled={clicked.length === 0}
            originalLink={campaign.link}
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Click Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {clicked.map((row) => (
              <tr
                key={row.campaignContactId}
                className="hover:bg-cream/50"
              >
                <td className="px-4 py-3 font-medium">
                  {row.contact?.name ?? "Unknown"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.contact?.phone || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.contact?.email || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    {row.clickCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clicked.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            No contacts have clicked this campaign yet.
          </div>
        )}
        </div>
      </div>

      {/* Not Clicked Table */}
      <div className="bg-white rounded-xl border border-line overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-ink">
              Not Clicked Contacts ({notClicked.length})
            </h2>
          </div>
          <ReCampaignButton
            contactIds={notClicked.map((row) => row.contact?.id).filter(Boolean) as string[]}
            disabled={notClicked.length === 0}
            originalLink={campaign.link}
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead className="bg-cream">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                Email
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {notClicked.map((row) => (
              <tr
                key={row.campaignContactId}
                className="hover:bg-cream/50"
              >
                <td className="px-4 py-3 font-medium">
                  {row.contact?.name ?? "Unknown"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.contact?.phone || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {row.contact?.email || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notClicked.length === 0 && (
          <div className="px-4 py-8 text-center text-muted">
            All assigned contacts have clicked this campaign.
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
