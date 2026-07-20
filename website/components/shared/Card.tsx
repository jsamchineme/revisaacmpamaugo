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
      className={`bg-white border border-line rounded-[20px] overflow-hidden transition-[320ms] flex flex-col group hover:-translate-y-[6px] hover:shadow-card ${className}`}
      style={{ borderColor: "var(--color-line)" }}
    >
      <div className="aspect-[16/11] overflow-hidden">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="w-full h-full object-cover transition-[600ms] group-hover:scale-[1.06]"
          loading="lazy"
        />
      </div>

      <div className="p-[26px] flex-1 flex flex-col">
        {tag && <Tag>{tag}</Tag>}
        <h3 className="text-[1.4rem] mb-[10px]">{title}</h3>
        <p className="text-muted text-[.95rem] flex-1">{description}</p>
        {(href || onLinkClick) &&
          (href ? (
            <a
              href={href}
              className="mt-[18px] inline-block font-semibold text-[.9rem] text-burgundy hover:text-burgundy-dark transition-colors"
            >
              {linkLabel}
            </a>
          ) : (
            <button
              onClick={onLinkClick}
              className="mt-[18px] font-semibold text-[.9rem] text-burgundy cursor-pointer hover:text-burgundy-dark transition-colors text-left"
            >
              {linkLabel}
            </button>
          ))}
      </div>
    </div>
  );
}
