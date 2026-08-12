"use client";

import * as React from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { name: "Prediction", href: "#predict" },
  { name: "Emergency", href: "#emergency" },
  { name: "Volunteer", href: "#volunteer" },
];

export default function Navbar() {
  const [isExpanded, setExpanded] = React.useState(true);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 200 && isExpanded) {
      setExpanded(false);
    } else if (latest <= 200 && !isExpanded) {
      setExpanded(true);
    }
  });

  const authOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const authPointerEvents = useTransform(scrollYProgress, [0, 0.05], ["auto", "none"]);

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
        <motion.nav
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          layout
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center overflow-hidden rounded-full border border-white/10 bg-black/50 shadow-lg backdrop-blur-md h-14",
          )}
        >
          <motion.div
            layout
            className="flex-shrink-0 flex items-center type-label pl-6 pr-4 cursor-pointer hover:text-white/80 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            RELIEF AI
          </motion.div>
          
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center overflow-hidden"
              >
                <div className="flex items-center gap-1 sm:gap-6 pr-4 border-r border-white/10 whitespace-nowrap">
                  {navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium text-neutral-400 hover:text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-premium)] px-2 py-1 rounded-md focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="pl-4 pr-6 flex items-center shrink-0">
              <Link 
                 href="/get-help" 
                 className="text-sm font-semibold text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Get Help <ArrowRight className="w-4 h-4" />
              </Link>
          </motion.div>
          
        </motion.nav>
      </div>

      {/* Quick access — no auth required for emergencies */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <motion.div 
        style={{ opacity: authOpacity, pointerEvents: authPointerEvents as any }}
        className="fixed top-6 right-6 md:right-12 z-50 hidden sm:flex items-center gap-4 transition-opacity duration-300"
      >
        <Link href="/dashboard" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
          Operations portal
        </Link>
        <Link href="/get-help" className="text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition-colors px-4 py-2 rounded-full">
          Get Help
        </Link>
      </motion.div>
    </>
  );
}

