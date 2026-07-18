"use client";

import { useState } from "react";
import { Button } from "./Button";

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
    <header className="sticky top-0 z-[100] bg-[rgba(250,247,242,0.92)] backdrop-blur-[10px] border-b border-line">
      <nav className="wrap flex items-center justify-between h-[74px]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-[12px] cursor-pointer">
          <div className="w-[40px] h-[40px] rounded-full bg-burgundy text-gold grid place-items-center font-serif font-bold text-[1.2rem]">
            IM
          </div>
          <div className="font-serif font-semibold text-[1.2rem] leading-[1.1]">
            Rev. Isaac Mpamaugo
            <small className="block font-sans text-[.62rem] tracking-[0.18em] uppercase text-gold-dark font-semibold">
              &amp; Rev. Mrs. Edith Mpamaugo
            </small>
          </div>
        </a>

        {/* Desktop Navigation */}
        <ul className="flex max-[900px]:hidden items-center gap-[30px] list-none">
          {NAV_LINKS.map((link) =>
            link.children ? (
              <li key={link.href} className="relative group">
                <a
                  href={link.href}
                  className="text-[.92rem] font-medium text-muted py-[6px] relative transition-[200ms] hover:text-ink"
                >
                  {link.label}
                </a>
                {/* Transparent bridge fills the gap so hover isn't lost moving toward the dropdown */}
                <div className="absolute top-full left-[-16px] hidden group-hover:block pt-[8px] z-[200]">
                  <ul className="bg-paper border border-line rounded-[10px] py-[6px] min-w-[170px] shadow-card list-none">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          className="block px-[20px] py-[9px] text-[.88rem] font-medium text-muted whitespace-nowrap transition-[150ms] hover:text-ink hover:bg-cream"
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
                  className="text-[.92rem] font-medium text-muted py-[6px] relative transition-[200ms] hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            )
          )}
        </ul>

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-[16px]">
          <div className="max-[900px]:hidden">
            <Button variant="primary" onClick={() => (window.location.href = "/contact")}>
              Get in Touch
            </Button>
          </div>

          {/* Hamburger */}
          <button
            className="hidden max-[900px]:flex flex-col gap-[5px] bg-none border-none cursor-pointer p-[8px]"
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

      {/* Mobile Menu Dropdown */}
      <div
        className={`${
          menuOpen ? "flex" : "hidden"
        } absolute top-[74px] left-0 right-0 flex-col bg-paper py-[20px] px-[24px] gap-[6px] border-b border-line shadow-card`}
      >
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
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              setMenuOpen(false);
              window.location.href = "/contact";
            }}
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </header>
  );
}
