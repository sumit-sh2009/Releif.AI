"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Zap } from "lucide-react";
import Link from "next/link";

interface ServiceStatus {
  service: string;
  status: string;
}

export function AIStatusBar() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const engine = services.find((s) => s.service === "ai-engine");
  const centre = services.find((s) => s.service === "ai-centre");
  const anyOnline = engine?.status === "online" || centre?.status === "online";

  return (
    <div className="flex items-center gap-3 mr-2">
      <Link
        href="/prediction"
        className="hidden md:flex items-center gap-2 type-overline px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-premium)]"
      >
        <BrainCircuit size={13} />
        AI Tools
      </Link>
      <div
        className={`flex items-center gap-1.5 type-overline px-2.5 py-1 rounded-full border ${
          anyOnline
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-neutral-500/30 bg-neutral-500/10 text-neutral-500"
        }`}
        title={
          loaded
            ? `Engine: ${engine?.status ?? "unknown"} · Centre: ${centre?.status ?? "unknown"}`
            : "Checking AI services..."
        }
      >
        <Zap size={11} className={anyOnline ? "animate-pulse" : ""} />
        {loaded ? (anyOnline ? "AI Live" : "AI Offline") : "..."}
      </div>
    </div>
  );
}
