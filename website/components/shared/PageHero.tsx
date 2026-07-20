import { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  className = "",
  children,
}: PageHeroProps) {
  return (
    <section className={`bg-soft py-[96px] pb-[80px] border-b border-line ${className}`}>
      <div className="wrap" style={{ maxWidth: "900px" }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-page-h1 mb-[16px]">{title}</h1>
        {subtitle && (
          <p className="text-muted max-w-[640px] text-[1.14rem]">{subtitle}</p>
        )}
        {children}
      </div>
    </section>
  );
}
