interface SocialLinksProps {
  links: { label: string; href: string }[];
  className?: string;
}

export function SocialLinks({ links, className = "" }: SocialLinksProps) {
  return (
    <div className={`flex gap-[10px] mt-[14px] ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          title={link.label}
          aria-label={link.label}
          className="w-[40px] h-[40px] rounded-[12px] bg-accent-soft text-burgundy grid place-items-center text-[1.1rem] transition-[200ms] hover:bg-burgundy hover:text-white"
        >
          {link.label.charAt(0)}
        </a>
      ))}
    </div>
  );
}
