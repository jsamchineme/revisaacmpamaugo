interface QuoteProps {
  text: string;
  author: string;
}

export function Quote({ text, author }: QuoteProps) {
  return (
    <div className="bg-white border border-line rounded-[20px] p-[34px] relative">
      <span
        className="absolute top-[6px] left-[18px] font-serif text-[4.5rem] text-burgundy opacity-[0.28] leading-none select-none"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p className="font-serif text-[1.18rem] italic text-ink my-[14px] mb-[18px] relative">
        {text}
      </p>
      <div className="text-[.85rem] font-semibold text-burgundy tracking-[0.04em]">
        — {author}
      </div>
    </div>
  );
}
