"use client";
import * as React from "react";
import { Sidebar } from "@/components/app/Sidebar";
import { Topbar } from "@/components/app/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = React.useState(false);

  return (
    <div className="app-shell ops-shell">
      <Sidebar 
        mobileNav={mobileNav} 
        setMobileNav={setMobileNav} 
      />
      <main className="main-content">
        <Topbar setMobileNav={setMobileNav} />
        <div className="page-wrap">
          {children}
        </div>
      </main>
    </div>
  );
}
