interface QuoteProps {
  text: string;
  author: string;
}

/**
 * Testimonial quote with large opening quote mark — matching .quote from template.
 */
export function Quote({ text, author }: QuoteProps) {
  return (
    <div className="bg-white border border-line rounded p-[34px] relative">
      {/* Opening quote mark */}
      <span
        className="absolute top-[6px] left-[18px] font-serif text-[4.5rem] text-gold opacity-35 leading-none select-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p className="font-serif text-[1.18rem] italic text-ink my-[14px] mb-[18px] relative">
        {text}
      </p>
      <div className="text-[.85rem] font-semibold text-gold-dark tracking-[0.04em]">
        — {author}
      </div>
    </div>
  );
}
