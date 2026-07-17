"use client";

import { Button } from "./Button";

interface CtaBandProps {
  headline: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonHref?: string;
  className?: string;
}

/**
 * CTA Band — gradient burgundy-to-burgundy-dark background, white text.
 * Matching .cta-band from template.
 */
export function CtaBand({
  headline,
  description,
  buttonLabel = "Get in Touch",
  onButtonClick,
  buttonHref,
  className = "",
}: CtaBandProps) {
  return (
    <div
      className={`text-white text-center rounded ${className}`}
      style={{ background: "linear-gradient(135deg, #5a2231, #431824)" }}
    >
      <div className="py-[70px] px-[30px]">
        <h2 className="text-white text-section-h2 mb-[14px]">{headline}</h2>
        <p className="text-white/85 max-w-[560px] mx-auto mb-[30px]">{description}</p>
        {(buttonHref || onButtonClick) && (
          buttonHref ? (
            <a href={buttonHref} className="inline-block py-[14px] px-[30px] rounded-full bg-gold text-white font-sans font-medium text-[.95rem] tracking-[0.02em] transition-[250ms] hover:bg-gold-dark hover:-translate-y-[2px]">
              {buttonLabel}
            </a>
          ) : (
            <Button variant="gold" onClick={onButtonClick}>
              {buttonLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
