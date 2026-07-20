"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SessionProvider, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Calendar,
  Settings,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/contacts", label: "Contacts", icon: Users },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/* ── Breadcrumb ───────────────────────────────────── */

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return <span>Dashboard</span>;

  const crumbs = segments.slice(1); // skip "admin"

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link
        href="/admin"
        className="text-muted hover:text-ink transition-colors"
      >
        Admin
      </Link>
      {crumbs.map((crumb, i) => {
        const href = `/admin/${crumbs.slice(0, i + 1).join("/")}`;
        const isLast = i === crumbs.length - 1;
        return (
          <span key={href} className="flex items-center gap-2">
            <span className="text-line">/</span>
            {isLast ? (
              <span className="font-medium text-ink capitalize">{crumb}</span>
            ) : (
              <Link
                href={href}
                className="text-muted hover:text-ink transition-colors capitalize"
              >
                {crumb}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* ── AdminShell ────────────────────────────────────── */

interface AdminShellProps {
  children: React.ReactNode;
  user: { name: string; email: string; role: string } | null;
}

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't render shell on login or verify-2fa pages
  if (pathname === "/admin/login" || pathname === "/admin/verify-2fa") {
    return <SessionProvider>{children}</SessionProvider>;
  }

  if (!user) {
    return <SessionProvider>{children}</SessionProvider>;
  }

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/admin/login");
  }

  return (
    <SessionProvider>
    <div className="min-h-screen bg-paper flex">
      {/* ── Sidebar ────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-60 bg-burgundy text-white flex flex-col overflow-y-auto transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-ink font-serif text-lg font-bold">
              CM
            </div>
            <div>
              <div className="font-serif text-base font-bold text-white leading-tight">
                Campaigns
              </div>
              <div className="text-xs text-white/60">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink font-medium text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user.name}
              </div>
              <div className="text-xs text-white/60 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile overlay ──────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-line">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-4">
              {/* Hamburger (mobile only) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-cream transition-colors"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-ink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <Breadcrumb pathname={pathname} />
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-sm text-muted hover:text-ink transition-colors flex items-center gap-1.5"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-burgundy hover:bg-burgundy/5 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
    </SessionProvider>
  );
}
