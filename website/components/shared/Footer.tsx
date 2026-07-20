"use client";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ministries", href: "/ministries" },
  { label: "Missions", href: "/missions" },
  { label: "Sermons", href: "/sermons" },
  { label: "Teachings", href: "/teachings" },
  { label: "Events", href: "/events" },
  { label: "Give", href: "/give" },
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
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-[40px] mb-[46px] max-[900px]:grid-cols-1">
          {/* Column 1 */}
          <div>
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="w-[40px] h-[40px] rounded-[11px] bg-burgundy text-white grid place-items-center font-display font-bold text-[1.05rem]">
                IM
              </div>
              <div className="font-display font-semibold text-[1.12rem] leading-[1.05] tracking-[-0.02em] text-ink">
                Rev. Isaac Mpamaugo
                <small className="block font-sans text-[.6rem] tracking-[0.18em] uppercase text-burgundy font-semibold mt-[2px]">
                  Ministry of the Word
                </small>
              </div>
            </div>
            <p className="text-[.92rem] mb-[8px] leading-relaxed">
              A lifetime of faithful service, sermons, teaching, and outreach —
              shared together by Rev. Isaac and Rev. Mrs. Edith Mpamaugo.
            </p>
            <div className="flex gap-[10px] mt-[14px]">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  aria-label={s.label}
                  className="w-[40px] h-[40px] rounded-[12px] bg-accent-soft text-burgundy grid place-items-center text-[1rem] transition-[220ms] hover:bg-burgundy hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-ink font-display text-[1.15rem] mb-[18px]">Quick Links</h4>
            <ul className="list-none">
              {QUICK_LINKS.map((link) => (
                <li key={link.href} className="mb-[10px]">
                  <a
                    href={link.href}
                    className="text-muted text-[.92rem] transition-[200ms] hover:text-burgundy"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-ink font-display text-[1.15rem] mb-[18px]">Contact</h4>
            <p className="text-[.92rem] mb-[8px]">hello@isaacmpamaugo.org</p>
            <p className="text-[.92rem] mb-[8px]">+234 (0)800 000 0000</p>
            <p className="text-[.92rem] mb-[8px]">Lagos, Nigeria</p>
            <div className="mt-[16px]">
              <a
                href="/contact"
                className="inline-flex items-center justify-center py-[12px] px-[26px] rounded-[12px] bg-burgundy text-white font-sans font-medium text-[.92rem] transition-[250ms] hover:bg-burgundy-dark hover:-translate-y-[2px]"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-line pt-[24px] text-center text-[.84rem] text-muted">
          &copy; {year} The Ministry of Rev. Isaac &amp; Rev. Mrs. Edith Mpamaugo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
