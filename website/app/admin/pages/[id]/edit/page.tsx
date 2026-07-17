import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageEditorClient } from "@/components/admin/page-editor/PageEditorClient";
import type { BaseSection } from "@/types/section";

export const dynamic = "force-dynamic";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-2">Page Not Found</h1>
        <p className="text-muted text-sm mb-4">
          The page you are looking for does not exist or has been deleted.
        </p>
        <a href="/admin/pages" className="text-gold hover:text-gold-dark text-sm font-medium">
          ← Back to Pages
        </a>
      </div>
    );
  }

  // Parse sections JSON
  let sections: BaseSection[] = [];
  try {
    const parsed = page.sections ? JSON.parse(page.sections) : [];
    if (Array.isArray(parsed)) {
      sections = parsed.map((s: any, i: number) => ({
        id: s.id ?? `sec_${i}`,
        type: s.type,
        order: s.order ?? i,
        content: s.content ?? {},
      }));
    }
  } catch {
    sections = [];
  }

  return (
    <PageEditorClient
      pageId={page.id}
      pageTitle={page.title}
      pageSlug={page.slug}
      pageMetaDescription={page.metaDescription}
      pagePublished={page.published}
      initialSections={sections}
    />
  );
}