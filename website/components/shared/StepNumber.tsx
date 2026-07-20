interface StepNumberProps {
  number: number;
  title: string;
  description: string;
}

export function StepNumber({ number, title, description }: StepNumberProps) {
  return (
    <div className="text-center p-[20px]">
      <div className="w-[56px] h-[56px] mx-auto mb-[18px] rounded-[14px] bg-accent-soft text-burgundy grid place-items-center font-display text-[1.4rem] font-bold">
        {number}
      </div>
      <h3 className="text-[1.25rem] mb-[8px]">{title}</h3>
      <p className="text-muted text-[.93rem]">{description}</p>
    </div>
  );
}
