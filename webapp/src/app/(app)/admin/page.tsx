"use client";

import * as React from "react";
import {
  ShieldCheck,
  Activity,
  Server,
  Cpu,
  Database,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { OpsGlassCard } from "@/components/app/OpsGlassCard";

interface ServiceCheck {
  service: string;
  status: string;
  detail?: unknown;
  latencyMs?: number;
}

interface HealthResponse {
  status: string;
  webapp: string;
  services: ServiceCheck[];
  timestamp: string;
}

interface ActivityEntry {
  id?: string;
  message: string;
  createdAt: string;
}

function statusIcon(status: string) {
  if (status === "online" || status === "healthy") {
    return <CheckCircle2 size={16} className="text-emerald-400" />;
  }
  if (status === "degraded" || status === "not_configured") {
    return <AlertTriangle size={16} className="text-amber-400" />;
  }
  return <XCircle size={16} className="text-red-400" />;
}

export default function AdminPage() {
  const [health, setHealth] = React.useState<HealthResponse | null>(null);
  const [activity, setActivity] = React.useState<ActivityEntry[]>([]);
  const [requestCount, setRequestCount] = React.useState(0);
  const [volunteerCount, setVolunteerCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [lastRefresh, setLastRefresh] = React.useState<Date | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const t0 = performance.now();
    try {
      const [healthRes, actRes, reqRes, volRes] = await Promise.all([
        fetch("/api/health"),
        fetch("/api/activity"),
        fetch("/api/emergency-requests"),
        fetch("/api/volunteers"),
      ]);

      const healthMs = Math.round(performance.now() - t0);

      if (healthRes.ok) {
        const data: HealthResponse = await healthRes.json();
        setHealth({ ...data, services: data.services.map((s) => ({ ...s, latencyMs: healthMs })) });
      }
      if (actRes.ok) setActivity(await actRes.json());
      if (reqRes.ok) {
        const reqs = await reqRes.json();
        setRequestCount(Array.isArray(reqs) ? reqs.length : 0);
      }
      if (volRes.ok) {
        const vols = await volRes.json();
        setVolunteerCount(Array.isArray(vols) ? vols.length : 0);
      }
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const systemStatus = health?.status ?? "unknown";

  return (
    <div>
      <PageHeader
        eyebrow="System Administration"
        icon={<ShieldCheck size={14} />}
        title="Command Center"
        description="Live health, inference services, and operational audit trail."
        actions={
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Platform", value: systemStatus.toUpperCase(), icon: <Activity size={16} />, glow: systemStatus === "healthy" ? "blue" as const : "red" as const },
          { label: "Emergencies", value: requestCount, icon: <Database size={16} />, glow: "none" as const },
          { label: "Volunteers", value: volunteerCount, icon: <Cpu size={16} />, glow: "none" as const },
          { label: "Audit events", value: activity.length, icon: <Clock size={16} />, glow: "none" as const },
        ].map((s, i) => (
          <OpsGlassCard key={s.label} glow={s.glow} delay={i * 0.05} className="p-5">
            <div className="flex items-center justify-between mb-2 text-neutral-500">
              <span className="report-section-title mb-0">{s.label}</span>
              {s.icon}
            </div>
            <div className="type-heading-l font-medium text-white">{s.value}</div>
          </OpsGlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OpsGlassCard className="p-6" glow="red">
          <h2 className="report-section-title mb-4 flex items-center gap-2">
            <Server size={14} /> Service Health
          </h2>
          {loading && !health ? (
            <div className="flex justify-center py-8 text-neutral-500">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="flex items-center gap-2 text-sm text-white">
                  {statusIcon("online")}
                  Webapp (Next.js)
                </div>
                <span className="text-xs text-emerald-400 font-mono">ONLINE</span>
              </div>
              {health?.services.map((svc) => (
                <div
                  key={svc.service}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/8"
                >
                  <div className="flex items-center gap-2 text-sm text-white capitalize">
                    {statusIcon(svc.status)}
                    {svc.service.replace("-", " ")}
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono uppercase ${
                        svc.status === "online" ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {svc.status}
                    </span>
                    {svc.latencyMs != null && (
                      <div className="text-[10px] text-neutral-600 mt-0.5">{svc.latencyMs}ms probe</div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/8">
                <div className="flex items-center gap-2 text-sm text-white">
                  {statusIcon("online")}
                  PostgreSQL
                </div>
                <span className="text-xs text-emerald-400 font-mono">CONNECTED</span>
              </div>
            </div>
          )}
        </OpsGlassCard>

        <OpsGlassCard className="p-6" delay={0.08}>
          <h2 className="report-section-title mb-4 flex items-center gap-2">
            <Activity size={14} /> Live Audit Log
          </h2>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {activity.length === 0 ? (
              <p className="text-sm text-neutral-500 py-6 text-center">No activity recorded yet.</p>
            ) : (
              activity.map((entry, i) => (
                <div
                  key={entry.id ?? `${entry.createdAt}-${i}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-200">{entry.message}</p>
                    <p className="text-[10px] text-neutral-600 mt-1 font-mono">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </OpsGlassCard>
      </div>

      {lastRefresh && (
        <p className="text-xs text-neutral-600 mt-6 text-center">
          Last system probe: {lastRefresh.toLocaleTimeString()} · Auto-refresh every 30s
        </p>
      )}
    </div>
  );
}
