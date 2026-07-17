import { type ReactNode } from "react";

interface StepNumberProps {
  number: number;
  title: string;
  description: string;
}

/**
 * Numbered step with burgundy circle + gold number — matching .step from template.
 * Uses CSS counter via style.
 */
export function StepNumber({ number, title, description }: StepNumberProps) {
  return (
    <div className="text-center p-[20px]">
      <div className="w-[60px] h-[60px] mx-auto mb-[18px] rounded-full bg-burgundy text-gold grid place-items-center font-serif text-[1.6rem] font-bold">
        {number}
      </div>
      <h3 className="text-[1.3rem] mb-[8px]">{title}</h3>
      <p className="text-muted text-[.93rem]">{description}</p>
    </div>
  );
}
