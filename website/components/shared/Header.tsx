"use client";

import { useState } from "react";
import { Button } from "./Button";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ministry", href: "/ministry" },
  { label: "Sermons", href: "/sermons" },
  { label: "Teachings", href: "/teachings" },
  { label: "Events", href: "/events" },
  { label: "Contact", href: "/contact" },
];

/**
 * Sticky Header — glass-blur backdrop, logo with "IM" mark, 7 nav links,
 * "Get in Touch" CTA, hamburger mobile menu at <= 900px.
 * Pixel-accurate to template header.
 */
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
              Ministry of the Word
            </small>
          </div>
        </a>

        {/* Desktop Navigation */}
        <ul className="flex max-[900px]:hidden items-center gap-[30px] list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-[.92rem] font-medium text-muted py-[6px] relative transition-[200ms] hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* For active link: underline effect via data-active */}
        {/* (active class managed by section renderer URL matching) */}

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
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="py-[12px] w-full border-b border-line text-[.92rem] font-medium text-muted hover:text-ink"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
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
