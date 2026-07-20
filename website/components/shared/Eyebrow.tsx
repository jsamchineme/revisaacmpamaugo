import { type ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/** Burgundy uppercase eyebrow label — matching .eyebrow from template */
export function Eyebrow({ children, className = "" }: EyebrowProps) {
  return (
    <div
      className={`font-sans text-eyebrow tracking-eyebrow uppercase text-burgundy font-semibold mb-[14px] ${className}`}
    >
      {children}
    </div>
  );
}
