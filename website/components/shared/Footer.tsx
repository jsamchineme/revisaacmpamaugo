"use client";

import { Button } from "./Button";
import { SocialLinks } from "./SocialLinks";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ministry", href: "/ministry" },
  { label: "Sermons", href: "/sermons" },
  { label: "Teachings", href: "/teachings" },
  { label: "Events", href: "/events" },
];

const SOCIALS = [
  { label: "Facebook", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "Instagram", href: "#" },
];

/**
 * Footer — Burgundy-dark bg, 3-column grid, copyright line.
 * Pixel-accurate to template footer.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-burgundy-dark text-white/78 pt-[64px] pb-[28px]">
      <div className="wrap">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-[40px] mb-[44px] max-[900px]:grid-cols-1">
          {/* Column 1: About + Socials */}
          <div>
            <div className="flex items-center gap-[12px] mb-[16px]">
              <div className="w-[40px] h-[40px] rounded-full bg-burgundy text-gold grid place-items-center font-serif font-bold text-[1.2rem]">
                IM
              </div>
              <div className="font-serif font-semibold text-[1.2rem] leading-[1.1] text-white">
                Rev. Isaac Mpamaugo
                <small className="block font-sans text-[.62rem] tracking-[0.18em] uppercase text-gold-dark font-semibold">
                  Ministry of the Word
                </small>
              </div>
            </div>
            <p className="text-[.92rem] mb-[8px] leading-relaxed">
              A lifetime of faithful service, sermons, and teaching — shared by
              Rev. Isaac and Rev. Mrs. Edith Mpamaugo.
            </p>
            <SocialLinks links={SOCIALS} variant="footer" />
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-[1.2rem] mb-[18px] font-serif font-semibold">
              Quick Links
            </h4>
            <ul className="list-none">
              {QUICK_LINKS.map((link) => (
                <li key={link.href} className="mb-[10px]">
                  <a
                    href={link.href}
                    className="text-white/75 text-[.92rem] transition-[200ms] hover:text-gold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact + CTA */}
          <div>
            <h4 className="text-white text-[1.2rem] mb-[18px] font-serif font-semibold">
              Contact
            </h4>
            <p className="text-[.92rem] mb-[8px]">hello@isaacmpamaugo.org</p>
            <p className="text-[.92rem] mb-[8px]">+234 (0)800 000 0000</p>
            <p className="text-[.92rem] mb-[8px]">Lagos, Nigeria</p>
            <div className="mt-[12px]">
              <Button
                variant="gold"
                onClick={() => (window.location.href = "/contact")}
              >
                Get in Touch
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/14 pt-[24px] text-center text-[.85rem] text-white/55">
          &copy; {year} The Ministry of Rev. Isaac Mpamaugo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
