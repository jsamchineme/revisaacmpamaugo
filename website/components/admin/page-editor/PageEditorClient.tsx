"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { BaseSection, SectionType } from "@/types/section";
import {
  SECTION_TYPE_MAP,
  createDefaultContent,
  generateSectionId,
  getSectionLabel,
} from "@/types/section";
import { SectionList } from "./SectionList";
import { AddSectionPicker } from "./AddSectionPicker";
import { SectionEditPanel } from "./SectionEditPanel";

interface PageEditorClientProps {
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  pageMetaDescription: string | null;
  pagePublished: boolean;
  initialSections: BaseSection[];
}

export function PageEditorClient({
  pageId,
  pageTitle: initialTitle,
  pageSlug: initialSlug,
  pageMetaDescription: initialMeta,
  pagePublished: initialPublished,
  initialSections,
}: PageEditorClientProps) {
  const router = useRouter();
  const [sections, setSections] = useState<BaseSection[]>(initialSections);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [metaDescription, setMetaDescription] = useState(initialMeta ?? "");
  const [published, setPublished] = useState(initialPublished);
  const [editingSection, setEditingSection] = useState<BaseSection | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BaseSection | null>(null);

  // Sync editing section content back to sections array
  const handleSectionSave = (updated: BaseSection) => {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSection(updated);
  };

  const handleAddSection = (type: SectionType) => {
    const newSection: BaseSection = {
      id: generateSectionId(),
      type,
      order: sections.length,
      content: createDefaultContent(type),
    };
    setSections((prev) => [...prev, newSection]);
    // Auto-open the edit panel for the new section
    setEditingSection(newSection);
    setPanelOpen(true);
  };

  const handleEditSection = (section: BaseSection) => {
    setEditingSection(section);
    setPanelOpen(true);
  };

  const handleDeleteSection = (section: BaseSection) => {
    setDeleteConfirm(section);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    setSections((prev) =>
      prev
        .filter((s) => s.id !== deleteConfirm.id)
        .map((s, i) => ({ ...s, order: i }))
    );
    setDeleteConfirm(null);
  };

  const handleReorder = (reordered: BaseSection[]) => {
    setSections(reordered);
  };

  const handleSave = async (publish?: boolean) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          metaDescription: metaDescription || null,
          sections: JSON.stringify(sections),
          published: publish ?? published,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save page");
      }

      if (publish !== undefined) {
        setPublished(publish);
      }
      setSavedAt(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, title, slug, metaDescription, published]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-ink">Edit Page</h1>
            <p className="text-sm text-muted mt-1">
              Drag sections to reorder. Click Edit to modify content.
            </p>
          </div>
          <a
            href="/admin/pages"
            className="text-sm text-gold hover:text-gold-dark font-medium"
          >
            ← Back to Pages
          </a>
        </div>

        {/* Page settings */}
        <div className="bg-white border border-line rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Slug</label>
              <div className="flex items-center">
                <span className="text-sm text-muted mr-1">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Meta Description (SEO)
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              placeholder="Brief description for search engines..."
              className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold resize-y"
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Sections ({sections.length})
          </h2>
          <AddSectionPicker onAdd={handleAddSection} />
        </div>
        <SectionList
          sections={sections}
          onReorder={handleReorder}
          onEdit={handleEditSection}
          onDelete={handleDeleteSection}
        />
      </div>

      {/* Save bar */}
      <div className="sticky bottom-4 bg-white border border-line rounded-xl shadow-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-sm text-burgundy font-medium">{error}</span>
          )}
          {savedAt && !error && (
            <span className="text-sm text-muted">
              Saved at {savedAt.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-burgundy"
            />
            <label htmlFor="published" className="text-sm text-ink">
              Published
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-ink border border-line rounded-lg hover:bg-cream transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-burgundy rounded-lg hover:bg-burgundy-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* Edit panel */}
      <SectionEditPanel
        section={editingSection}
        isOpen={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSectionSave}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-card max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg font-semibold text-ink mb-2">
              Delete Section?
            </h3>
            <p className="text-sm text-muted mb-4">
              Are you sure you want to delete the &ldquo;{getSectionLabel(deleteConfirm.type)}&rdquo; section? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-ink border border-line rounded-lg hover:bg-cream transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-burgundy rounded-lg hover:bg-burgundy-dark transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}