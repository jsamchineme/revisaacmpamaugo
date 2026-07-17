"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Button, GhostButtonLight } from "./Button";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  backgroundImage: string;
  /** Optional split headline with <br> — pass as ReactNode */
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  children?: ReactNode;
}

/**
 * Full-width hero with bg image + overlay, h1, p, and button group.
 * Matching .hero from template exactly.
 */
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
  const overlayStart = "rgba(40,18,26,0.72)";
  const overlayEnd = "rgba(40,18,26,0.82)";

  return (
    <section
      className="relative text-white text-center overflow-hidden"
      style={{ padding: "140px 0 130px" }}
    >
      {/* Background image + gradient overlay */}
      <div
        className="absolute inset-0 -z-[1]"
        style={{
          background: `linear-gradient(${overlayStart},${overlayEnd}), url(${backgroundImage}) center/cover`,
        }}
      />

      <div className="wrap">
        <h1
          className="text-white text-hero-h1 mb-[22px]"
          dangerouslySetInnerHTML={{ __html: headline }}
        />
        <p className="text-[1.2rem] max-w-[680px] mx-auto mb-[36px] text-white/90">
          {subheadline}
        </p>

        <div className="flex gap-[16px] justify-center flex-wrap">
          {primaryButtonLabel && primaryButtonHref && (
            <Link
              href={primaryButtonHref}
              className="inline-block py-[14px] px-[30px] rounded-full bg-gold text-white font-sans font-medium text-[.95rem] tracking-btn cursor-pointer transition-[250ms] text-center hover:bg-gold-dark hover:-translate-y-[2px]"
            >
              {primaryButtonLabel}
            </Link>
          )}
          {primaryButtonLabel && !primaryButtonHref && onPrimaryClick && (
            <Button variant="gold" onClick={onPrimaryClick}>
              {primaryButtonLabel}
            </Button>
          )}
          {secondaryButtonLabel && secondaryButtonHref && (
            <Link
              href={secondaryButtonHref}
              className="inline-block py-[14px] px-[30px] rounded-full font-sans font-medium text-[.95rem] tracking-btn cursor-pointer transition-[250ms] text-center bg-transparent text-white border-[1.5px] border-white/50 hover:border-gold hover:text-gold"
            >
              {secondaryButtonLabel}
            </Link>
          )}
          {secondaryButtonLabel && !secondaryButtonHref && onSecondaryClick && (
            <GhostButtonLight onClick={onSecondaryClick}>
              {secondaryButtonLabel}
            </GhostButtonLight>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}
