interface SocialLinksProps {
  links: { label: string; href: string }[];
  className?: string;
  /** Use footer variant (smaller, rgba background circles) */
  variant?: "default" | "footer";
}

/** Social icon links — matching .socials from template */
export function SocialLinks({
  links,
  className = "",
  variant = "default",
}: SocialLinksProps) {
  const iconSize = variant === "footer" ? "w-[38px] h-[38px]" : "w-[44px] h-[44px]";
  const defaultBg = variant === "footer"
    ? "bg-white/10 hover:bg-gold"
    : "bg-cream hover:bg-gold hover:text-white";

  return (
    <div className={`flex gap-[10px] mt-[14px] ${className}`}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          title={link.label}
          aria-label={link.label}
          className={`${iconSize} rounded-full ${defaultBg} grid place-items-center text-[1.1rem] transition-[200ms]`}
        >
          {link.label.charAt(0)}
        </a>
      ))}
    </div>
  );
}
