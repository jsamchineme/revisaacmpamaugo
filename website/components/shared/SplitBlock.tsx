"use client";

import { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface SplitBlockProps {
  imageUrl: string;
  imageAlt?: string;
  eyebrow?: string;
  title: string;
  description: string;
  extraParagraphs?: string[];
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonHref?: string;
  reverse?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SplitBlock({
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  description,
  extraParagraphs,
  buttonLabel,
  onButtonClick,
  buttonHref,
  reverse = false,
  className = "",
  children,
}: SplitBlockProps) {
  const textColumn = (
    <div>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[clamp(2rem,4vw,2.7rem)] mb-[20px]">{title}</h2>
      <p className="text-muted mb-[16px]">{description}</p>
      {extraParagraphs?.map((p, i) => (
        <p key={i} className="text-muted mb-[16px]">
          {p}
        </p>
      ))}
      {buttonLabel && (buttonHref || onButtonClick) && (
        buttonHref ? (
          <a
            href={buttonHref}
            className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] bg-ink text-paper font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:opacity-90 hover:-translate-y-[2px]"
          >
            {buttonLabel}
          </a>
        ) : (
          <button
            onClick={onButtonClick}
            className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] bg-ink text-paper font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:opacity-90 hover:-translate-y-[2px]"
          >
            {buttonLabel}
          </button>
        )
      )}
      {children}
    </div>
  );

  const imageColumn = (
    <img
      src={imageUrl}
      alt={imageAlt}
      className="rounded-[24px] shadow-card w-full"
    />
  );

  return (
    <div
      className={`grid grid-cols-2 gap-[64px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[36px] ${className}`}
    >
      {reverse ? (
        <>
          {textColumn}
          {imageColumn}
        </>
      ) : (
        <>
          {imageColumn}
          {textColumn}
        </>
      )}
    </div>
  );
}
