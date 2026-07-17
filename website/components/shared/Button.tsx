"use client";

import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "gold" | "ghost";

interface ButtonBaseProps {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-burgundy text-white hover:bg-burgundy-dark",
  gold: "bg-gold text-white hover:bg-gold-dark",
  ghost:
    "bg-transparent text-ink border-[1.5px] border-line hover:border-gold hover:text-gold-dark",
};

/**
 * Button with 3 variants matching the template:
 * - primary: burgundy bg, white text
 * - gold: gold bg, white text
 * - ghost: transparent with line border, turns gold on hover
 */
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base =
    "inline-block py-[14px] px-[30px] rounded-full font-sans font-medium text-[.95rem] tracking-btn cursor-pointer border-none transition-[250ms] text-center hover:-translate-y-[2px]";

  return (
    <button
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

/** Ghost button variant for use on dark backgrounds (white text, semi-transparent border) */
export function GhostButtonLight({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-block py-[14px] px-[30px] rounded-full font-sans font-medium text-[.95rem] tracking-btn cursor-pointer border-none transition-[250ms] text-center hover:-translate-y-[2px] bg-transparent text-white border-[1.5px] border-white/50 hover:border-gold hover:text-gold ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
