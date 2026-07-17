"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BaseSection } from "@/types/section";
import { getSectionLabel, getSectionDescription } from "@/types/section";

interface SectionListProps {
  sections: BaseSection[];
  onReorder: (sections: BaseSection[]) => void;
  onEdit: (section: BaseSection) => void;
  onDelete: (section: BaseSection) => void;
}

export function SectionList({ sections, onReorder, onEdit, onDelete }: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));
    onReorder(reordered);
  };

  if (sections.length === 0) {
    return (
      <div className="border-2 border-dashed border-line rounded-xl p-12 text-center">
        <p className="text-muted text-sm">
          No sections yet. Click &ldquo;Add Section&rdquo; to start building this page.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <SortableSectionItem
              key={section.id}
              section={section}
              index={index}
              onEdit={() => onEdit(section)}
              onDelete={() => onDelete(section)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableSectionItemProps {
  section: BaseSection;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableSectionItem({ section, index, onEdit, onDelete }: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const label = getSectionLabel(section.type);
  const description = getSectionDescription(section.type);

  // Get a content summary
  const summary = getContentSummary(section);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white border border-line rounded-lg p-3 ${
        isDragging ? "shadow-card" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted hover:text-ink px-1 py-2 touch-none"
        title="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </button>

      {/* Order number */}
      <span className="text-xs font-mono text-muted w-6 text-center shrink-0">{index + 1}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{label}</span>
          {summary && (
            <span className="text-xs text-muted truncate">— {summary}</span>
          )}
        </div>
        <p className="text-xs text-muted mt-0.5 truncate">{description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1.5 text-xs font-medium text-gold hover:text-gold-dark border border-line rounded-lg hover:border-gold transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-2 py-1.5 text-xs font-medium text-burgundy hover:text-burgundy-dark border border-line rounded-lg hover:border-burgundy transition-colors"
          title="Delete section"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

function getContentSummary(section: BaseSection): string {
  const c = section.content;
  if (!c) return "";

  // Try to find a headline or title field
  const titleFields = ["headline", "title", "eyebrow", "missionTitle"];
  for (const key of titleFields) {
    if (c[key] && typeof c[key] === "string" && c[key].length > 0) {
      return c[key].slice(0, 60);
    }
  }

  // For repeaters, show count
  const repeaterFields = ["stats", "features", "items", "steps", "buttons"];
  for (const key of repeaterFields) {
    if (Array.isArray(c[key])) {
      return `${c[key].length} item${c[key].length !== 1 ? "s" : ""}`;
    }
  }

  return "";
}