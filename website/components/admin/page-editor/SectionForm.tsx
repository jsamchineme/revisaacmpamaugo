"use client";

import type { SectionFieldDef, SectionType } from "@/types/section";
import { TiptapEditor } from "@/components/admin/tiptap/TiptapEditor";
import { MediaPicker } from "./MediaPicker";
import { RepeaterField } from "./RepeaterField";

interface SectionFormProps {
  sectionType: SectionType;
  fields: SectionFieldDef[];
  content: Record<string, any>;
  onChange: (content: Record<string, any>) => void;
}

export function SectionForm({ fields, content, onChange }: SectionFormProps) {
  const updateField = (key: string, value: any) => {
    onChange({ ...content, [key]: value });
  };

  if (fields.length === 0) {
    return (
      <div className="text-sm text-muted italic py-4">
        This section type has no configurable fields. It renders automatically from site settings.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const fieldValue = content[field.key];

        // Repeater field
        if (field.type === "repeater") {
          return (
            <RepeaterField
              key={field.key}
              fieldDef={field}
              value={Array.isArray(fieldValue) ? fieldValue : []}
              onChange={(val) => updateField(field.key, val)}
            />
          );
        }

        // Testimonial select
        if (field.type === "testimonialSelect") {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
              <p className="text-xs text-muted">
                Testimonials are managed in the Testimonials section. Selected testimonials will appear here.
              </p>
              <TestimonialSelector
                value={Array.isArray(fieldValue) ? fieldValue : []}
                onChange={(val) => updateField(field.key, val)}
              />
            </div>
          );
        }

        // Rich text editor
        if (field.type === "richtext") {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
              <TiptapEditor
                value={fieldValue ?? ""}
                onChange={(html) => updateField(field.key, html)}
                placeholder={field.placeholder ?? "Start writing..."}
              />
            </div>
          );
        }

        // Image picker
        if (field.type === "image") {
          return (
            <MediaPicker
              key={field.key}
              value={fieldValue ?? ""}
              onChange={(url) => updateField(field.key, url)}
              label={field.label}
            />
          );
        }

        // Color input
        if (field.type === "color") {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={extractHexColor(fieldValue ?? "#000000")}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="w-12 h-10 rounded border border-line cursor-pointer"
                />
                <input
                  type="text"
                  value={fieldValue ?? ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  placeholder="rgba(0,0,0,0.5) or #000000"
                  className="flex-1 px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          );
        }

        // Number input
        if (field.type === "number") {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
              <input
                type="number"
                value={fieldValue ?? 0}
                onChange={(e) => updateField(field.key, parseInt(e.target.value, 10) || 0)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
              />
            </div>
          );
        }

        // Textarea
        if (field.type === "textarea") {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
              <textarea
                value={fieldValue ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold resize-y"
              />
            </div>
          );
        }

        // Select / options
        if (field.options) {
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
              <select
                value={fieldValue ?? field.defaultValue ?? ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // Default: text input
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-ink mb-1.5">{field.label}</label>
            <input
              type="text"
              value={fieldValue ?? ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 text-sm border border-line rounded-lg bg-white focus:outline-none focus:border-gold"
            />
          </div>
        );
      })}
    </div>
  );
}

// Helper: extract a hex color from rgba/hex string for the color picker
function extractHexColor(colorStr: string): string {
  if (colorStr.startsWith("#")) {
    return colorStr.slice(0, 7);
  }
  // Try to parse rgba
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    return (
      "#" +
      [r, g, b]
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("")
    );
  }
  return "#000000";
}

// Inline testimonial selector (fetches from API)
function TestimonialSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (val: string[]) => void;
}) {
  return (
    <div className="text-xs text-muted border border-line rounded-lg p-3 bg-cream/30">
      Testimonial IDs: {value.length > 0 ? value.join(", ") : "None selected"}
      <p className="mt-1">Edit the testimonials field directly in the database or via the Testimonials admin page.</p>
    </div>
  );
}