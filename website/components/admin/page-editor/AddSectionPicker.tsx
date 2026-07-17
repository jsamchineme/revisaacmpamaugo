"use client";

import { useState, useRef, useEffect } from "react";
import type { SectionType } from "@/types/section";
import { SECTION_TYPES } from "@/types/section";

interface AddSectionPickerProps {
  onAdd: (type: SectionType) => void;
}

export function AddSectionPicker({ onAdd }: AddSectionPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (type: SectionType) => {
    onAdd(type);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-burgundy text-white text-sm font-medium rounded-lg hover:bg-burgundy-dark transition-colors"
      >
        <span className="text-lg leading-none">+</span> Add Section
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-line rounded-lg shadow-card z-30 max-h-96 overflow-y-auto">
          <div className="p-1.5">
            {SECTION_TYPES.map((meta) => (
              <button
                key={meta.type}
                type="button"
                onClick={() => handleSelect(meta.type)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-cream transition-colors group"
              >
                <div className="text-sm font-medium text-ink group-hover:text-burgundy">
                  {meta.label}
                </div>
                <div className="text-xs text-muted mt-0.5">{meta.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}