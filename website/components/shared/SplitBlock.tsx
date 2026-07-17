"use client";

import { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";
import { Button } from "./Button";

interface SplitBlockProps {
  imageUrl: string;
  imageAlt?: string;
  eyebrow?: string;
  title: string;
  description: string;
  /** Additional paragraphs */
  extraParagraphs?: string[];
  buttonLabel?: string;
  onButtonClick?: () => void;
  buttonHref?: string;
  /** Reverse: image on the right */
  reverse?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Split content block — 2-column grid, image + text.
 * Matching .split from template.
 */
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
          <a href={buttonHref} className="inline-block py-[14px] px-[30px] rounded-full bg-burgundy text-white font-sans font-medium text-[.95rem] tracking-[0.02em] transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]">
            {buttonLabel}
          </a>
        ) : (
          <Button variant="primary" onClick={onButtonClick}>
            {buttonLabel}
          </Button>
        )
      )}
      {children}
    </div>
  );

  const imageColumn = (
    <img
      src={imageUrl}
      alt={imageAlt}
      className="rounded shadow-card w-full"
    />
  );

  return (
    <div
      className={`grid grid-cols-2 gap-[60px] items-center max-[900px]:grid-cols-1 max-[900px]:gap-[30px] ${className}`}
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
