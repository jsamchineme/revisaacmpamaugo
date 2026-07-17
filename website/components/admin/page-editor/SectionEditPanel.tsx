"use client";

import type { BaseSection } from "@/types/section";
import { SECTION_TYPE_MAP, getSectionLabel } from "@/types/section";
import { SectionForm } from "./SectionForm";

interface SectionEditPanelProps {
  section: BaseSection | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (section: BaseSection) => void;
}

export function SectionEditPanel({ section, isOpen, onClose, onSave }: SectionEditPanelProps) {
  if (!isOpen || !section) return null;

  const meta = SECTION_TYPE_MAP[section.type];
  const label = meta ? meta.label : section.type;

  const handleContentChange = (content: Record<string, any>) => {
    // Content is updated live in parent via onSave
    onSave({ ...section, content });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-card flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">{label}</h2>
            <p className="text-xs text-muted mt-0.5">
              {meta?.description ?? "Edit section content"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-ink text-2xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {meta && meta.fields.length > 0 ? (
            <SectionForm
              sectionType={section.type}
              fields={meta.fields}
              content={section.content}
              onChange={handleContentChange}
            />
          ) : (
            <div className="text-sm text-muted italic py-4">
              This section type has no configurable fields. It renders automatically.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-line flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink border border-line rounded-lg hover:bg-cream transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}