"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  /** Accessible name for the control. */
  label: string;
  /** Renders the trigger in the burgundy "this filter is doing something" state. */
  active?: boolean;
  className?: string;
}

export default function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  active = false,
  className = "",
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function openMenu() {
    setHighlight(selectedIndex);
    setOpen(true);
  }

  function commit(index: number) {
    onChange(options[index].value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) commit(highlight);
        else openMenu();
        return;
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!open) return openMenu();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setHighlight((i) => (i + step + options.length) % options.length);
        return;
      }
      case "Home":
        if (open) {
          e.preventDefault();
          setHighlight(0);
        }
        return;
      case "End":
        if (open) {
          e.preventDefault();
          setHighlight(options.length - 1);
        }
        return;
      case "Tab":
        setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        aria-activedescendant={open ? `${listId}-${highlight}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`inline-flex items-center justify-between gap-2 w-full pl-3 pr-2.5 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-burgundy/30 ${
          active
            ? "bg-burgundy text-white border-burgundy hover:bg-burgundy-dark"
            : "bg-white text-ink border-line hover:bg-cream"
        }`}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          } ${active ? "text-white/80" : "text-muted"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-20 mt-1 min-w-full w-max max-w-[16rem] py-1 bg-white border border-line rounded-lg shadow-menu overflow-hidden"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => commit(i)}
                className={`flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-pointer ${
                  i === highlight ? "bg-cream" : ""
                } ${isSelected ? "font-medium text-burgundy" : "text-ink"}`}
              >
                <span className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.hint && <span className="text-xs text-muted font-normal">{opt.hint}</span>}
                </span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-burgundy"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
