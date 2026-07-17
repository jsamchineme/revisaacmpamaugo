"use client";

import { Tag } from "./Tag";

interface CardProps {
  imageUrl: string;
  imageAlt?: string;
  tag?: string;
  title: string;
  description: string;
  linkLabel?: string;
  onLinkClick?: () => void;
  href?: string;
  className?: string;
}

/**
 * Content card with image thumbnail, tag, title, description, and link.
 * Matching .card from template — hover: translateY(-5px) + shadow, image zoom.
 */
export function Card({
  imageUrl,
  imageAlt,
  tag,
  title,
  description,
  linkLabel = "Learn more",
  onLinkClick,
  href,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bg-white border border-line rounded overflow-hidden transition-[300ms] flex flex-col hover:-translate-y-[5px] hover:shadow-card ${className}`}
    >
      {/* 16:10 Image Thumbnail */}
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover transition-[500ms] group-hover:scale-[1.06]"
          loading="lazy"
        />
      </div>

      {/* Card Body */}
      <div className="p-[26px] flex-1 flex flex-col">
        {tag && <Tag>{tag}</Tag>}
        <h3 className="text-[1.4rem] mb-[10px]">{title}</h3>
        <p className="text-muted text-[.95rem] flex-1">{description}</p>
        {(href || onLinkClick) && (
          href ? (
            <a
              href={href}
              className="mt-[16px] inline-block font-semibold text-[.9rem] text-burgundy hover:text-gold-dark transition-colors"
            >
              {linkLabel}
            </a>
          ) : (
            <button
              onClick={onLinkClick}
              className="mt-[16px] font-semibold text-[.9rem] text-burgundy cursor-pointer hover:text-gold-dark transition-colors text-left"
            >
              {linkLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
