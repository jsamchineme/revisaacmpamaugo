import { type ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Gold-dark uppercase eyebrow label — matching .eyebrow from template */
export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <div
      className={`font-sans text-eyebrow tracking-eyebrow uppercase text-gold-dark font-semibold mb-[14px] ${className}`}
    >
      {children}
    </div>
  );
}
