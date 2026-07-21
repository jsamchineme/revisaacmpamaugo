"use client";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Sermons", href: "/sermons" },
  { label: "Teachings", href: "/teachings" },
  { label: "Events", href: "/events" },
  { label: "Give", href: "/give" },
];

const MINISTRY_LINKS = [
  { label: "Ministries", href: "/ministries" },
  { label: "Missions", href: "/missions" },
  { label: "Contact", href: "/contact" },
];

const SOCIALS = [
  { label: "Facebook", href: "#", icon: "f" },
  { label: "YouTube", href: "#", icon: "▶" },
  { label: "Instagram", href: "#", icon: "◻" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-soft border-t border-line text-muted pt-[70px] pb-[28px]">
      <div className="wrap">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-[48px] mb-[52px] max-[1024px]:grid-cols-[1.4fr_1fr_1fr] max-[900px]:grid-cols-1">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-[12px] mb-[18px]">
              <div className="w-[40px] h-[40px] rounded-[11px] bg-burgundy text-white grid place-items-center font-display font-bold text-[1.05rem] flex-none">
                IM
              </div>
              <div className="font-display font-semibold text-[1.08rem] leading-[1.1] tracking-[-0.02em] text-ink">
                Rev. Isaac Mpamaugo
                <small className="block font-sans text-[.58rem] tracking-[0.16em] uppercase text-burgundy font-semibold mt-[3px]">
                  & Rev. Mrs. Edith Mpamaugo
                </small>
              </div>
            </div>
            <p className="text-[.9rem] leading-relaxed mb-[18px]">
              A lifetime of faithful service, sermons, teaching, and outreach — shared with all who are seeking.
            </p>
            <div className="flex gap-[10px]">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  aria-label={s.label}
                  className="w-[38px] h-[38px] rounded-[10px] bg-accent-soft text-burgundy grid place-items-center text-[.95rem] transition-[220ms] hover:bg-burgundy hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-ink font-display text-[1rem] font-semibold mb-[16px]">Navigate</h4>
            <ul className="list-none space-y-[8px]">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[.9rem] transition-[200ms] hover:text-burgundy">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ministry */}
          <div>
            <h4 className="text-ink font-display text-[1rem] font-semibold mb-[16px]">Ministry</h4>
            <ul className="list-none space-y-[8px]">
              {MINISTRY_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-[.9rem] transition-[200ms] hover:text-burgundy">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-ink font-display text-[1rem] font-semibold mb-[16px]">Get in Touch</h4>
            <div className="space-y-[8px] mb-[20px]">
              <p className="text-[.9rem]">hello@isaacmpamaugo.org</p>
              <p className="text-[.9rem]">+234 (0)800 000 0000</p>
              <p className="text-[.9rem]">Lagos, Nigeria</p>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center justify-center py-[11px] px-[22px] rounded-[10px] bg-burgundy text-white font-sans font-medium text-[.88rem] transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
            >
              Send a Message
            </a>
          </div>
        </div>

        <div className="border-t border-line pt-[22px] flex flex-col sm:flex-row items-center justify-between gap-[8px] text-[.82rem] text-muted">
          <span>© {year} The Ministry of Rev. Isaac & Rev. Mrs. Edith Mpamaugo. All rights reserved.</span>
          <span>Lagos, Nigeria</span>
        </div>
      </div>
    </footer>
  );
}
