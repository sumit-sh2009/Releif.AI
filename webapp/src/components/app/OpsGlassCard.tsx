"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface OpsGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "red" | "blue" | "none";
  delay?: number;
}

export function OpsGlassCard({
  children,
  className,
  glow = "none",
  delay = 0,
}: OpsGlassCardProps) {
  const glowClass =
    glow === "red"
      ? "ops-glass-glow-red"
      : glow === "blue"
        ? "ops-glass-glow-blue"
        : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className={cn("ops-glass-card", glowClass, className)}
    >
      {children}
    </motion.div>
  );
}
