"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";

export function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-[var(--spacing-container-padding-mobile)] md:px-[var(--spacing-container-padding-desktop)] transition-all duration-300",
        isScrolled
          ? "bg-surface-container-lowest/70 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm"
          : "bg-transparent border-transparent"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(183,19,26,0.5)]">
          <span className="text-white font-bold text-lg">R</span>
        </div>
        <span className="font-headline-md text-on-surface tracking-tight font-semibold">
          RELIEF
        </span>
      </Link>

      {/* Centered Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        {[
          { name: "Dashboard", href: "#" },
          { name: "Prediction", href: "#" },
          { name: "Command Center", href: "#" },
          { name: "Volunteer", href: "#" },
          { name: "Technology", href: "#" },
        ].map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            className="text-body-sm font-medium text-on-surface hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Right Action */}
      <div className="flex items-center gap-4">
        <Link
          href="#"
          className="text-body-sm font-medium text-on-surface hover:text-primary transition-colors hidden sm:block"
        >
          Login
        </Link>
        <button className="md:hidden p-2 text-on-surface hover:bg-surface-variant rounded-full transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </motion.header>
  );
}
