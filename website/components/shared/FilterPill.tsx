"use client";

interface FilterPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Filter pill button — matching .filters button from template.
 * Active state: burgundy bg, white text.
 */
export function FilterPill({
  label,
  active = false,
  onClick,
  className = "",
}: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`py-[9px] px-[22px] rounded-full border-[1.5px] font-sans text-[.85rem] font-medium cursor-pointer transition-[200ms] ${
        active
          ? "bg-burgundy text-white border-burgundy"
          : "bg-transparent text-muted border-line hover:border-gold"
      } ${className}`}
    >
      {label}
    </button>
  );
}

interface FilterBarProps {
  filters: { label: string; value: string }[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Horizontal filter bar — matching .filters from template */
export function FilterBar({
  filters,
  activeValue,
  onChange,
  className = "",
}: FilterBarProps) {
  return (
    <div className={`flex gap-[10px] justify-center flex-wrap mb-[44px] ${className}`}>
      {filters.map((f) => (
        <FilterPill
          key={f.value}
          label={f.label}
          active={activeValue === f.value}
          onClick={() => onChange(f.value)}
        />
      ))}
    </div>
  );
}
