interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

/** Contact info row with icon circle, label, and value — matching .info-row from template */
export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-[14px] mb-[22px] items-start">
      <div className="flex-none w-[44px] h-[44px] rounded-full bg-cream grid place-items-center text-[1.2rem]">
        {icon}
      </div>
      <div>
        <b className="block font-serif text-[1.1rem]">{label}</b>
        <span className="text-muted text-[.92rem]">{value}</span>
      </div>
    </div>
  );
}
