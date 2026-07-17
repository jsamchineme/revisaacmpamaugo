import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const pages = await prisma.page.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      metaDescription: true,
      published: true,
      updatedAt: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Pages</h1>
          <p className="text-sm text-muted mt-1">
            Manage your site pages and their sections.
          </p>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-cream/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Slug
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Updated
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted text-sm">
                  No pages found. Run the seed script to create initial pages.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr
                  key={page.id}
                  className="border-b border-line last:border-0 hover:bg-cream/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-ink">{page.title}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted font-mono">/{page.slug}</span>
                  </td>
                  <td className="px-5 py-4">
                    {page.published ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-cream text-muted rounded-full">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-muted">
                      {formatDate(page.updatedAt)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <a
                      href={`/admin/pages/${page.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gold hover:text-gold-dark border border-line rounded-lg hover:border-gold transition-colors"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}