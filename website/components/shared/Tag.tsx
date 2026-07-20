import { type ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  className?: string;
}

/** Burgundy uppercase tag label — matching .tag from template */
export function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-block text-tag tracking-tag uppercase text-burgundy font-semibold mb-[10px] ${className}`}
    >
      {children}
    </span>
  );
}
