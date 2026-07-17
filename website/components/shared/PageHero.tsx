import { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Page hero (inner pages) — cream background, centered.
 * Matching .phero from template.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  className = "",
  children,
}: PageHeroProps) {
  return (
    <section className={`bg-cream text-center py-[80px] border-b border-line ${className}`}>
      <div className="wrap">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-page-h1 mb-[12px]">{title}</h1>
        {subtitle && (
          <p className="text-muted max-w-[620px] mx-auto text-[1.1rem]">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
