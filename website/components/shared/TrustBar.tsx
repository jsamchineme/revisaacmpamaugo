interface TrustBarStat {
  number: string;
  label: string;
}

interface TrustBarProps {
  stats: TrustBarStat[];
  className?: string;
}

/**
 * Trust strip — burgundy background, 4-column stats.
 * Matching .trust from template. Responsive: 2-col at 900px, 1-col at 480px.
 */
export function TrustBar({ stats, className = "" }: TrustBarProps) {
  return (
    <div className={`bg-burgundy text-white ${className}`}>
      <div className="wrap grid grid-cols-4 gap-[24px] py-[36px] text-center max-[900px]:grid-cols-2 max-[900px]:gap-[30px] max-[480px]:grid-cols-1">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="font-serif text-[2.3rem] font-bold text-gold">
              {stat.number}
            </div>
            <div className="text-[.82rem] tracking-[0.06em] text-white/82">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
