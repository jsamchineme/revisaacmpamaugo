interface TrustBarStat {
  number: string;
  label: string;
}

interface TrustBarProps {
  stats: TrustBarStat[];
  className?: string;
}

export function TrustBar({ stats, className = "" }: TrustBarProps) {
  return (
    <div className={`bg-soft border-t border-b border-line ${className}`}>
      <div className="wrap grid grid-cols-4 gap-[24px] py-[40px] text-center max-[900px]:grid-cols-2 max-[900px]:gap-[30px] max-[480px]:grid-cols-1">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex flex-col items-center gap-[4px]">
            {i > 0 && (
              <span className="hidden max-[900px]:hidden absolute" aria-hidden="true" />
            )}
            <div className="font-display text-[2.4rem] font-bold text-ink leading-none">
              {stat.number}
            </div>
            <div className="text-[.82rem] tracking-[0.06em] uppercase text-muted font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
