interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-[14px] mb-[22px] items-start">
      <div className="flex-none w-[44px] h-[44px] rounded-[14px] bg-accent-soft grid place-items-center text-[1.2rem]">
        {icon}
      </div>
      <div>
        <b className="block font-display text-[1rem] font-semibold text-ink">{label}</b>
        <span className="text-muted text-[.92rem]">{value}</span>
      </div>
    </div>
  );
}
