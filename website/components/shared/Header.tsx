"use client";

import { useState } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Ministries",
    href: "/ministries",
    children: [
      { label: "Our Ministries", href: "/ministries" },
      { label: "Missions", href: "/missions" },
    ],
  },
  { label: "Sermons", href: "/sermons" },
  { label: "Teachings", href: "/teachings" },
  { label: "Events", href: "/events" },
  { label: "Give", href: "/give" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-[100] border-b border-line"
      style={{ background: "color-mix(in srgb,var(--color-paper) 80%,transparent)", backdropFilter: "blur(18px)" }}
    >
      <nav className="wrap flex items-center justify-between h-[74px]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-[12px] cursor-pointer">
          <div className="w-[40px] h-[40px] rounded-[11px] bg-burgundy text-white grid place-items-center font-display font-bold text-[1.05rem]">
            IM
          </div>
          <div className="font-display font-semibold text-[1.12rem] leading-[1.05] tracking-[-0.02em]">
            Rev. Isaac Mpamaugo
            <small className="block font-sans text-[.6rem] tracking-[0.18em] uppercase text-burgundy font-semibold mt-[2px]">
              Ministry of the Word
            </small>
          </div>
        </a>

        {/* Desktop Navigation */}
        <ul className="flex max-[900px]:hidden items-center gap-[32px] list-none">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <li key={link.href} className="relative group">
                <a
                  href={link.href}
                  className="text-[.9rem] font-medium text-muted py-[6px] relative transition-[200ms] hover:text-ink"
                >
                  {link.label}
                </a>
                <div className="absolute top-full left-[-16px] hidden group-hover:block pt-[8px] z-[200]">
                  <ul className="bg-paper border border-line rounded-[14px] py-[6px] min-w-[170px] shadow-menu list-none">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          className="block px-[20px] py-[9px] text-[.88rem] font-medium text-muted whitespace-nowrap transition-[150ms] hover:text-ink hover:bg-soft"
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[.9rem] font-medium text-muted py-[6px] transition-[200ms] hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            )
          )}
        </ul>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-[16px]">
          <a
            href="/contact"
            className="max-[900px]:hidden inline-flex items-center justify-center py-[12px] px-[26px] rounded-[12px] bg-ink text-paper font-sans font-medium text-[.92rem] tracking-btn transition-[250ms] hover:-translate-y-[2px] hover:opacity-90"
          >
            Get in Touch
          </a>
          <button
            className="hidden max-[900px]:flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-[8px]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="w-[24px] h-[2px] bg-ink transition-[300ms]" />
            <span className="w-[24px] h-[2px] bg-ink transition-[300ms]" />
            <span className="w-[24px] h-[2px] bg-ink transition-[300ms]" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-[74px] left-0 right-0 flex flex-col bg-paper py-[20px] px-[26px] gap-[6px] border-b border-line shadow-menu">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <div key={link.href}>
                <a
                  href={link.href}
                  className="py-[12px] w-full border-b border-line text-[.92rem] font-medium text-muted hover:text-ink block"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
                {link.children.map((child) => (
                  <a
                    key={child.href}
                    href={child.href}
                    className="py-[10px] pl-[20px] w-full border-b border-line text-[.88rem] font-medium text-muted hover:text-ink block"
                    onClick={() => setMenuOpen(false)}
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="py-[12px] w-full border-b border-line text-[.92rem] font-medium text-muted hover:text-ink"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <div className="pt-[8px]">
            <a
              href="/contact"
              className="w-full flex items-center justify-center py-[12px] px-[26px] rounded-[12px] bg-ink text-paper font-sans font-medium text-[.92rem]"
              onClick={() => setMenuOpen(false)}
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
