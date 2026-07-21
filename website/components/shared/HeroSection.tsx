"use client";

import Link from "next/link";
import { type ReactNode } from "react";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  backgroundImage: string;
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  children?: ReactNode;
}

export function HeroSection({
  headline,
  subheadline,
  backgroundImage,
  primaryButtonLabel = "Listen to a Sermon",
  primaryButtonHref,
  secondaryButtonLabel = "Get in Touch",
  secondaryButtonHref,
  onPrimaryClick,
  onSecondaryClick,
  children,
}: HeroSectionProps) {
  return (
    <section className="bg-paper overflow-hidden" style={{ padding: "80px 0 0" }}>
      <div className="wrap grid grid-cols-[1fr_1fr] gap-[60px] items-end max-[900px]:grid-cols-1 max-[900px]:gap-[40px]">
        {/* Text column */}
        <div className="pb-[80px] max-[900px]:pb-0 max-[900px]:text-center">
          <p className="font-display text-[.78rem] font-semibold tracking-[0.18em] uppercase text-burgundy mb-[20px]">
            ● Ministry of the Word
          </p>
          <h1
            className="text-hero-h1 mb-[22px]"
            dangerouslySetInnerHTML={{ __html: headline }}
          />
          <p className="text-[1.12rem] max-w-[540px] mb-[36px] text-muted max-[900px]:mx-auto">
            {subheadline}
          </p>

          <div className="flex gap-[14px] flex-wrap max-[900px]:justify-center">
            {primaryButtonLabel && primaryButtonHref && (
              <Link
                href={primaryButtonHref}
                className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] bg-ink text-paper font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:opacity-90 hover:-translate-y-[2px]"
              >
                {primaryButtonLabel}
              </Link>
            )}
            {primaryButtonLabel && !primaryButtonHref && onPrimaryClick && (
              <button
                onClick={onPrimaryClick}
                className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] bg-ink text-paper font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:opacity-90 hover:-translate-y-[2px]"
              >
                {primaryButtonLabel}
              </button>
            )}
            {secondaryButtonLabel && secondaryButtonHref && (
              <Link
                href={secondaryButtonHref}
                className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] border-[1.5px] border-line text-ink font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:border-burgundy hover:text-burgundy hover:-translate-y-[2px]"
              >
                {secondaryButtonLabel}
              </Link>
            )}
            {secondaryButtonLabel && !secondaryButtonHref && onSecondaryClick && (
              <button
                onClick={onSecondaryClick}
                className="inline-flex items-center justify-center py-[15px] px-[30px] rounded-[12px] border-[1.5px] border-line text-ink font-sans font-medium text-[.95rem] tracking-btn transition-[250ms] hover:border-burgundy hover:text-burgundy hover:-translate-y-[2px]"
              >
                {secondaryButtonLabel}
              </button>
            )}
          </div>

          {children}
        </div>

        {/* Image column */}
        <div className="relative self-end max-[900px]:hidden">
          <div
            className="rounded-tl-[32px] rounded-tr-[32px] overflow-hidden"
            style={{ aspectRatio: "4/5" }}
          >
            <img
              src={backgroundImage}
              alt="Rev. Isaac Mpamaugo"
              className="w-full h-full object-cover object-top"
            />
          </div>
          {/* Soft fade at bottom blending into page */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
            style={{ background: "linear-gradient(to top, var(--color-paper), transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
