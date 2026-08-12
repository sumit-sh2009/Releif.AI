"use client";
import * as React from "react";
import { Radio, ChevronRight, ShieldCheck, X, Activity, Navigation, Siren, Sparkles, Users, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, type Role } from "./RoleContext";

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity, href: '/dashboard', roles: ['admin', 'volunteer'] },
  { id: 'map', label: 'Live Map', icon: Navigation, href: '/map', roles: ['admin', 'volunteer'] },
  { id: 'emergency', label: 'Emergencies', icon: Siren, href: '/emergency-requests', roles: ['admin', 'volunteer'] },
  { id: 'prediction', label: 'AI Prediction', icon: Sparkles, href: '/prediction', roles: ['admin', 'volunteer'] },
  { id: 'ai-aid', label: 'AI First Aid', icon: BrainCircuit, href: '/ai-first-aid', roles: ['admin', 'volunteer'] },
  { id: 'volunteers', label: 'Volunteers', icon: Users, href: '/volunteers', roles: ['admin'] },
  { id: 'admin', label: 'Command Center', icon: ShieldCheck, href: '/admin', roles: ['admin'] },
];

const ROLES: Role[] = ['volunteer', 'admin'];
const ROLE_LABELS: Record<Role, string> = {
  victim: 'Citizen',
  volunteer: 'Volunteer',
  admin: 'Command',
};

export function Sidebar({ mobileNav, setMobileNav, counts }: { mobileNav: boolean; setMobileNav: (v: boolean) => void; counts?: { critical?: number } }) {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  const allowedNavItems = navItems.filter(item => item.roles.includes(role));

  const cycleRole = () => {
    const idx = ROLES.indexOf(role);
    setRole(ROLES[(idx + 1) % ROLES.length]);
  };

  return (
    <>
      <aside className={`sidebar ops-sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Radio size={19} /></div>
          <div><strong>RELIEFAI</strong><span>OPERATIONS</span></div>
          <button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18} /></button>
        </div>

        <div className="sidebar-caption">COMMAND CENTER</div>
        <nav>
          {allowedNavItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.id} href={item.href} className={`nav-item ops-nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileNav(false)}>
                <Icon size={17} />
                <span>{item.label}</span>
                {item.id === 'emergency' && counts?.critical && counts.critical > 0 && <em>{counts.critical}</em>}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-caption">VIEW MODE</div>
          <div className="operator ops-operator">
            <div className="avatar">{ROLE_LABELS[role].slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{ROLE_LABELS[role]}</strong>
              <span>OPS CONSOLE · <i>ONLINE</i></span>
            </div>
            <ChevronRight size={15} />
          </div>
          <button className="role-switch ops-role-switch" onClick={cycleRole} type="button">
            <ShieldCheck size={15} className="shrink-0" /> Switch view: {ROLE_LABELS[role]}
          </button>
          <Link href="/" className="role-switch ops-role-switch mt-2 no-underline">
            <span className="shrink-0" aria-hidden>←</span>
            <span>Back to public site</span>
          </Link>
        </div>
      </aside>
      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
    </>
  );
}
