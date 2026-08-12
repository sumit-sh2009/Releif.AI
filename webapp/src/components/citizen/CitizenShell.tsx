"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/get-help", label: "Report emergency" },
  { href: "/tracking", label: "Track request" },
];

export function CitizenShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="citizen-shell min-h-screen relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(220,38,38,0.05),transparent)]" />
      </div>

      <header className="citizen-nav">
        <Link href="/" className="citizen-brand">
          Relief AI
        </Link>

        <nav className="citizen-nav-links" aria-label="Emergency help">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`citizen-nav-link ${pathname.startsWith(item.href) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/dashboard" className="citizen-nav-link hidden sm:inline-flex">
            Operations
          </Link>
          <Link href="/get-help" className="citizen-nav-cta">
            Get Help
          </Link>
        </nav>
      </header>

      <main className="citizen-main">{children}</main>

      <footer className="citizen-footer">
        <p className="type-overline text-[var(--text-disabled)]">
          Encrypted · 24/7 response network
        </p>
      </footer>
    </div>
  );
}
