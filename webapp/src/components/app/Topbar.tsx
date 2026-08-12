"use client";
import * as React from "react";
import { Menu, Command, Bell, SlidersHorizontal, Siren, Waves, Truck, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import { AIStatusBar } from "./AIStatusBar";

function Notification({text,time,icon}:{text:string;time:string;icon:React.ReactNode}) { 
  return (
    <div className="notification-item">
      <div className="notice-icon">{icon}</div>
      <div><strong>{text}</strong><span>{time}</span></div>
    </div>
  );
}

export function Topbar({ setMobileNav }: { setMobileNav: (v: boolean) => void }) {
  const [search, setSearch] = React.useState('');
  const [showNotifications, setShowNotifications] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!search.trim()) return;
    router.push(`/emergency-requests?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <>
      <header className="topbar ops-topbar">
        <button className="menu-button" onClick={() => setMobileNav(true)}>
          <Menu size={20} />
        </button>
        <form className="command-search ops-search" onSubmit={runSearch}>
          <Command size={17} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search requests, locations..."
          />
          <kbd>⌘K</kbd>
        </form>
        <div className="top-actions">
          <AIStatusBar />
          <button 
            className="icon-button" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            className="icon-button" 
            onClick={() => setShowNotifications(!showNotifications)} 
            aria-label="Notifications"
          >
            <Bell size={18} /><b>3</b>
          </button>
        </div>
      </header>
      {showNotifications && (
        <div className="notification-pop">
          <div className="pop-head"><strong>Notifications</strong><span>3 new</span></div>
          <Notification text="Critical emergency reported in Sector C" time="3 min ago" icon={<Siren/>} />
          <Notification text="Flood probability increased to 82%" time="8 min ago" icon={<Waves/>} />
          <Notification text="Alex is on the way to Riverside District" time="12 min ago" icon={<Truck/>} />
        </div>
      )}
    </>
  );
}
