"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest/70 backdrop-blur-xl z-[60] flex items-center justify-between px-[var(--spacing-container-padding-desktop)] border-b border-outline-variant/10 pl-72">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(183,19,26,0.5)]">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="font-headline-md text-on-surface tracking-tight font-semibold">
            RELIEF
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
          <Bell className="w-6 h-6 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <div className="text-body-sm font-bold text-on-surface">Command Lead</div>
            <div className="type-overline text-on-surface-variant">Active Session</div>
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 shadow-sm bg-surface-container flex items-center justify-center">
            <span className="font-bold text-sm">CL</span>
          </div>
        </div>
      </div>
    </header>
  );
}
