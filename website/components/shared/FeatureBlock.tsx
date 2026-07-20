import { type ReactNode } from "react";

interface FeatureBlockProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}

export function FeatureBlock({
  icon,
  title,
  description,
  className = "",
  children,
}: FeatureBlockProps) {
  return (
    <div
      className={`flex items-start gap-[18px] p-[30px] bg-white border border-line rounded-[20px] transition-[320ms] hover:-translate-y-[4px] hover:shadow-card hover:border-accent-soft ${className}`}
    >
      <div className="flex-none w-[54px] h-[54px] rounded-[14px] bg-accent-soft grid place-items-center text-[1.5rem]">
        {icon}
      </div>
      <div>
        <h3 className="text-[1.25rem] mb-[6px]">{title}</h3>
        <p className="text-muted text-[.93rem]">{description}</p>
        {children}
      </div>
    </div>
  );
}
