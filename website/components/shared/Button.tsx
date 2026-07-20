"use client";

import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "gold" | "ghost";

interface ButtonBaseProps {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:opacity-90",
  gold: "bg-burgundy text-white hover:bg-burgundy-dark",
  ghost: "bg-transparent text-ink border-[1.5px] border-line hover:border-burgundy hover:text-burgundy",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement>) {
  const base =
    "inline-flex items-center justify-center gap-[8px] py-[15px] px-[30px] rounded-[12px] font-sans font-medium text-[.95rem] tracking-btn cursor-pointer border-none transition-[250ms] text-center hover:-translate-y-[2px]";

  return (
    <button
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

/** Ghost button for dark backgrounds */
export function GhostButtonLight({
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-[8px] py-[15px] px-[30px] rounded-[12px] font-sans font-medium text-[.95rem] tracking-btn cursor-pointer transition-[250ms] text-center hover:-translate-y-[2px] bg-transparent text-white border-[1.5px] border-white/50 hover:border-white hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
