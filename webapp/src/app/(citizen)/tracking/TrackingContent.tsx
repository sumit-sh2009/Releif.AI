"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  HeartPulse,
  CheckCircle2,
  Loader2,
  Navigation,
  Phone,
  Users,
  RefreshCw,
} from "lucide-react";
import type { EmergencyRequestWithHistory } from "@/types/emergency-request";
import { priorityToUrgency, statusLabel, statusToDisplay, timeAgo } from "@/lib/format";

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Submitted" },
  { key: "VERIFIED", label: "Verified" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "IN_PROGRESS", label: "En route" },
  { key: "RESOLVED", label: "Resolved" },
] as const;

function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    submitted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    verified: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    assigned: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    on_the_way: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  const cls = colors[value] ?? "bg-white/5 text-neutral-400 border-white/10";
  return (
    <span className={`type-label inline-flex px-3 py-1 rounded-full border ${cls}`}>
      {statusLabel[value] ?? value.replace(/_/g, " ")}
    </span>
  );
}

export default function TrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";

  const [code, setCode] = React.useState(initialCode);
  const [searchInput, setSearchInput] = React.useState(initialCode);
  const [request, setRequest] = React.useState<EmergencyRequestWithHistory | null>(null);
  const [loading, setLoading] = React.useState(!!initialCode);
  const [error, setError] = React.useState("");
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const fetchRequest = React.useCallback(async (requestCode: string) => {
    if (!requestCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/emergency-requests/track?code=${encodeURIComponent(requestCode.trim())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request not found");
      }
      const data: EmergencyRequestWithHistory = await res.json();
      setRequest(data);
      setCode(data.requestCode);
      setLastUpdated(new Date());
    } catch (err) {
      setRequest(null);
      setError(err instanceof Error ? err.message : "Failed to load request");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialCode) fetchRequest(initialCode);
  }, [initialCode, fetchRequest]);

  React.useEffect(() => {
    if (!code) return;
    const interval = setInterval(() => fetchRequest(code), 10000);
    return () => clearInterval(interval);
  }, [code, fetchRequest]);

  const currentStepIndex = request ? TIMELINE_STEPS.findIndex((s) => s.key === request.status) : -1;
  const urgency = request ? priorityToUrgency(request.priority) : "normal";

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-12">
        <p className="type-overline text-red-400/90 mb-4">Status updates</p>
        <h1 className="type-display text-white mb-4">Track your request</h1>
        <p className="type-body text-[var(--text-secondary)] prose-width-narrow mx-auto mb-2">
          Enter the ID from your confirmation screen to see live progress.
        </p>
      </div>

      <div className="citizen-card mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRequest(searchInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              placeholder="RF-XXXXXXXX"
              className="citizen-input pl-11 type-mono tracking-wider"
            />
          </div>
          <button type="submit" className="citizen-btn-primary" disabled={loading || !searchInput.trim()}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Track
          </button>
        </form>
        <p className="type-caption text-[var(--text-muted)] mt-4">
          Demo ID:{" "}
          <button
            type="button"
            className="type-mono text-red-400 hover:underline"
            onClick={() => {
              setSearchInput("RF-7K29X4P1");
              fetchRequest("RF-7K29X4P1");
            }}
          >
            RF-7K29X4P1
          </button>
        </p>
      </div>

      {error && (
        <div className="citizen-card mb-6 border-red-500/30 type-body-sm text-red-400">{error}</div>
      )}

      {loading && !request && (
        <div className="citizen-card py-16 flex flex-col items-center gap-3 type-body text-[var(--text-muted)]">
          <Loader2 size={28} className="animate-spin text-red-400" />
          Loading request…
        </div>
      )}

      {request && (
        <>
          <div className="citizen-card mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="type-overline text-[var(--text-muted)] mb-2">Request ID</p>
                <p className="type-mono text-2xl text-white">{request.requestCode}</p>
              </div>
              <StatusBadge value={statusToDisplay(request.status)} />
            </div>

            <div className="flex items-center gap-2 type-heading-s text-white mb-2">
              <HeartPulse size={16} className={urgency === "critical" ? "text-red-400" : "text-amber-400"} />
              {request.emergencyType}
            </div>
            <p className="type-body-sm text-[var(--text-secondary)] mb-6 prose-width">{request.description}</p>

            <div className="grid sm:grid-cols-2 gap-4 type-body-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-2"><MapPin size={14} /> {request.location}</div>
              <div className="flex items-center gap-2"><Users size={14} /> {request.peopleAffected} people affected</div>
              <div className="flex items-center gap-2"><Clock size={14} /> Reported {timeAgo(request.createdAt)}</div>
              {request.etaMinutes && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Navigation size={14} /> ETA ~{request.etaMinutes} min
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/8">
              <p className="type-overline text-[var(--text-muted)] mb-2">Responder</p>
              {request.assignedVolunteer ? (
                <>
                  <p className="type-heading-s text-white">{request.assignedVolunteer.name}</p>
                  <p className="type-caption text-[var(--text-muted)] mt-1">En route to your location</p>
                </>
              ) : (
                <p className="type-body-sm text-[var(--text-muted)]">Matching nearest available responder…</p>
              )}
              {lastUpdated && (
                <button type="button" onClick={() => fetchRequest(code)} className="citizen-btn-secondary mt-4 text-xs">
                  <RefreshCw size={13} /> Updated {lastUpdated.toLocaleTimeString()}
                </button>
              )}
            </div>
          </div>

          <div className="citizen-card mb-8">
            <p className="type-overline text-[var(--text-muted)] mb-8">Progress</p>
            <div className="flex items-center justify-between mb-10">
              {TIMELINE_STEPS.map((step, i) => {
                const done = currentStepIndex >= i;
                const active = currentStepIndex === i;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 relative flex-1">
                    {i > 0 && (
                      <div
                        className={`absolute right-1/2 top-1.5 h-px -z-10 ${done ? "bg-red-500/50" : "bg-white/10"}`}
                        style={{ width: "100%", left: "-50%" }}
                      />
                    )}
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 ${
                        active ? "bg-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                          : done ? "bg-red-500/60 border-red-500/60"
                          : "bg-transparent border-white/20"
                      }`}
                    />
                    <span className={`type-overline text-center ${done ? "text-white" : "text-[var(--text-disabled)]"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {request.statusHistory && request.statusHistory.length > 0 && (
              <div className="space-y-4">
                {request.statusHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <CheckCircle2 size={14} className="text-emerald-400 mt-1 shrink-0" />
                    <div>
                      <p className="type-body-sm text-white">{statusLabel[entry.status] ?? entry.status}</p>
                      {entry.note && <p className="type-caption text-[var(--text-muted)]">{entry.note}</p>}
                      <p className="type-caption text-[var(--text-disabled)] mt-1">{timeAgo(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/get-help" className="citizen-btn-primary">
              <Phone size={15} /> New request
            </Link>
          </div>
        </>
      )}

      {!loading && !request && !error && (
        <div className="citizen-card py-16 text-center">
          <Navigation size={36} className="mx-auto mb-4 text-[var(--text-disabled)]" />
          <p className="type-body text-[var(--text-muted)] prose-width-narrow mx-auto">
            Enter your request ID above to see live status updates.
          </p>
        </div>
      )}
    </div>
  );
}
