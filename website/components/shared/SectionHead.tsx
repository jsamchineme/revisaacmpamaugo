import { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface SectionHeadProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Section heading with optional eyebrow, h2 title, and lead paragraph.
 * Matching .section-head from template.
 */
export function SectionHead({
  eyebrow,
  title,
  subtitle,
  className = "",
  children,
}: SectionHeadProps) {
  return (
    <div
      className={`max-w-section-head mx-auto mb-section-head-bottom text-center ${className}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {children}
      <h2 className="text-section-h2 mb-[14px]">{title}</h2>
      {subtitle && <p className="text-lead text-muted">{subtitle}</p>}
    </div>
  );
}
