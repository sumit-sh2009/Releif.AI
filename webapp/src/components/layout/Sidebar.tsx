"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BrainCircuit,
  Network,
  PhoneCall,
  Users,
  Map,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Prediction", href: "/prediction", icon: BrainCircuit },
  { name: "AI First Aid", href: "/ai-first-aid", icon: Network },
  { name: "Emergency Requests", href: "/emergency-requests", icon: PhoneCall },
  { name: "Volunteer Portal", href: "/volunteers", icon: Users },
  { name: "Live Tracking", href: "/tracking", icon: Map },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container z-50 flex flex-col pt-20 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary text-on-primary shadow-lg"
                  : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
              )}
            >
              <Icon
                className={cn(
                  "mr-4 w-6 h-6",
                  isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                )}
              />
              <span className="font-body-md font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
