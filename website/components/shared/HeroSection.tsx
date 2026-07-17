"use client";

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
      className="relative text-white text-center py-[140px_130px] overflow-hidden"
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
          {primaryButtonLabel && (primaryButtonHref || onPrimaryClick) && (
            <Button variant="gold" onClick={onPrimaryClick}>
              {primaryButtonLabel}
            </Button>
          )}
          {secondaryButtonLabel && (secondaryButtonHref || onSecondaryClick) && (
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
