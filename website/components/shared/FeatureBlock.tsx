import { type ReactNode } from "react";

interface FeatureBlockProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Feature block with icon circle, title, and description — matching .feature from template.
 */
export function FeatureBlock({
  icon,
  title,
  description,
  className = "",
  children,
}: FeatureBlockProps) {
  return (
    <div
      className={`flex items-center gap-[18px] p-[30px] bg-white border border-line rounded ${className}`}
    >
      <div className="flex-none w-[56px] h-[56px] rounded-full bg-cream grid place-items-center text-[1.6rem]">
        {icon}
      </div>
      <div>
        <h3 className="text-[1.35rem] mb-[6px]">{title}</h3>
        <p className="text-muted text-[.93rem]">{description}</p>
        {children}
      </div>
    </div>
  );
}
