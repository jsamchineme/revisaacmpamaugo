"use client";

import { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

/**
 * FAQ toggle item with slide-down answer — matching .qa from template.
 */
export function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`qa border-b border-line ${open ? "open" : ""}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left bg-none border-none py-[22px] font-display text-[1.15rem] font-semibold text-ink cursor-pointer flex justify-between items-center gap-[16px]"
      >
        {question}
        <span
          className={`text-burgundy text-[1.5rem] flex-none transition-[300ms] ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[350ms] text-muted ${
          open ? "max-h-[300px] pb-[22px]" : "max-h-0"
        }`}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
}
