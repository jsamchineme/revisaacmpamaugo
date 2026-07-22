"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES, Country, parseDialed } from "@/lib/countries";

function FlagImg({ iso, name }: { iso: string; name: string }) {
  const code = iso.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      srcSet={`https://flagcdn.com/w40/${code}.png 2x`}
      width={20}
      height={15}
      alt={name}
      className="rounded-sm object-cover shrink-0"
    />
  );
}

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export default function PhoneInput({
  id,
  value,
  onChange,
  placeholder = "Phone number",
  hasError = false,
}: PhoneInputProps) {
  const parsed = parseDialed(value);
  const [country, setCountry] = useState<Country>(parsed.country);
  const [local, setLocal] = useState(parsed.local);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    const composed = local ? `${country.dialCode}${local}` : "";
    if (value !== composed) {
      const p = parseDialed(value);
      setCountry(p.country);
      setLocal(p.local);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function selectCountry(c: Country) {
    setCountry(c);
    onChange(local ? `${c.dialCode}${local}` : "");
    setOpen(false);
    setSearch("");
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d\s\-()]/g, "");
    setLocal(raw);
    const digits = raw.replace(/\D/g, "");
    onChange(digits ? `${country.dialCode}${digits}` : "");
  }

  const borderClass = hasError ? "border-red-400" : "border-line";
  const filtered = search.trim()
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.dialCode.includes(search)
      )
    : COUNTRIES;

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      {/* Country selector trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 pl-3 pr-2 border ${borderClass} border-r-0 rounded-l-lg bg-cream hover:bg-cream/70 transition-colors text-sm shrink-0 focus:outline-none focus:ring-2 focus:ring-gold focus:z-10 ${hasError ? "bg-red-50" : ""}`}
      >
        <FlagImg iso={country.isoCode} name={country.name} />
        <span className="text-ink font-medium">{country.dialCode}</span>
        <svg
          className={`w-3 h-3 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Phone number input */}
      <input
        id={id}
        type="tel"
        value={local}
        onChange={handleLocalChange}
        placeholder={placeholder}
        className={`flex-1 min-w-0 px-4 py-2 border ${borderClass} rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:z-10 ${hasError ? "border-red-400 bg-red-50" : ""}`}
      />

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-line rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-line">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code…"
              className="w-full px-3 py-1.5 text-sm border border-line rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted text-center">No results</li>
            ) : (
              filtered.map((c) => (
                <li key={`${c.isoCode}-${c.dialCode}`}>
                  <button
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-cream transition-colors text-left ${
                      c.isoCode === country.isoCode && c.dialCode === country.dialCode
                        ? "bg-cream font-medium"
                        : ""
                    }`}
                  >
                    <FlagImg iso={c.isoCode} name={c.name} />
                    <span className="flex-1 truncate text-ink">{c.name}</span>
                    <span className="text-muted shrink-0 tabular-nums">{c.dialCode}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
