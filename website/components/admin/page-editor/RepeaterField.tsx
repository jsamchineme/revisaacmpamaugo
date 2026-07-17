"use client";

import type { SectionFieldDef } from "@/types/section";

interface RepeaterFieldProps {
  fieldDef: SectionFieldDef;
  value: Record<string, any>[];
  onChange: (value: Record<string, any>[]) => void;
}

export function RepeaterField({ fieldDef, value, onChange }: RepeaterFieldProps) {
  const repeaterFields = fieldDef.repeaterFields ?? [];
  const repeaterLabel = fieldDef.repeaterLabel ?? "Item";

  const addItem = () => {
    const newItem: Record<string, any> = {};
    for (const f of repeaterFields) {
      newItem[f.key] = f.defaultValue ?? "";
    }
    onChange([...value, newItem]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, val: any) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [key]: val } : item)));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= value.length) return;
    const newValue = [...value];
    [newValue[index], newValue[newIndex]] = [newValue[newIndex], newValue[index]];
    onChange(newValue);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">{fieldDef.label}</label>
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="border border-line rounded-lg p-3 bg-cream/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted">
                {repeaterLabel} {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="text-xs text-muted hover:text-ink disabled:opacity-30 px-1"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === value.length - 1}
                  className="text-xs text-muted hover:text-ink disabled:opacity-30 px-1"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs text-burgundy hover:text-burgundy-dark px-1"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {repeaterFields.map((rf) => (
                <div key={rf.key}>
                  <label className="block text-xs text-muted mb-0.5">{rf.label}</label>
                  {rf.type === "textarea" ? (
                    <textarea
                      value={item[rf.key] ?? ""}
                      onChange={(e) => updateItem(index, rf.key, e.target.value)}
                      placeholder={rf.placeholder}
                      rows={2}
                      className="w-full px-2.5 py-1.5 text-sm border border-line rounded bg-white focus:outline-none focus:border-gold"
                    />
                  ) : rf.options ? (
                    <select
                      value={item[rf.key] ?? ""}
                      onChange={(e) => updateItem(index, rf.key, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-line rounded bg-white focus:outline-none focus:border-gold"
                    >
                      {rf.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={item[rf.key] ?? ""}
                      onChange={(e) => updateItem(index, rf.key, e.target.value)}
                      placeholder={rf.placeholder}
                      className="w-full px-2.5 py-1.5 text-sm border border-line rounded bg-white focus:outline-none focus:border-gold"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="text-sm text-gold hover:text-gold-dark font-medium border border-dashed border-line rounded-lg px-3 py-2 w-full hover:border-gold transition-colors"
        >
          + Add {repeaterLabel}
        </button>
      </div>
    </div>
  );
}