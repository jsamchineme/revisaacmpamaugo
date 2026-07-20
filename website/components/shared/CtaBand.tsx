"use client";

interface CtaBandProps {
  headline: string;
  description: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonHref?: string;
  className?: string;
}

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
      className={`text-paper text-center rounded-[28px] relative overflow-hidden ${className}`}
      style={{ background: "var(--color-ink)" }}
    >
      {/* radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(600px 280px at 50% 0,color-mix(in srgb,var(--color-burgundy) 40%,transparent),transparent 70%)" }}
      />
      <div className="relative py-[80px] px-[30px]">
        <h2 className="text-paper text-section-h2 mb-[14px]">{headline}</h2>
        <p className="max-w-[560px] mx-auto mb-[30px]" style={{ color: "color-mix(in srgb,var(--color-paper) 70%,transparent)" }}>
          {description}
        </p>
        {(buttonHref || onButtonClick) &&
          (buttonHref ? (
            <a
              href={buttonHref}
              className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
            >
              {buttonLabel}
            </a>
          ) : (
            <button
              onClick={onButtonClick}
              className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
            >
              {buttonLabel}
            </button>
          ))}
      </div>
    </div>
  );
}
