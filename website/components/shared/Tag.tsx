import { type ReactNode } from "react";

interface TagProps {
  children: ReactNode;
  className?: string;
}

/** Gold uppercase tag label — matching .tag from template */
export function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-block text-tag tracking-tag uppercase text-gold-dark font-semibold mb-[10px] ${className}`}
    >
      {children}
    </span>
  );
}
