"use client";
import * as React from "react";
import {
  Search, ShieldCheck, HeartPulse, Siren, CheckCircle2,
  MapPin, ExternalLink, Zap, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/components/app/RoleContext";
import { PageHeader } from "@/components/app/PageHeader";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";
import type { EmergencyRequest } from "@/types/emergency-request";
import { priorityToUrgency, statusToDisplay, timeAgo } from "@/lib/format";

function StatusBadge({ value }: { value: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    urgent: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    normal: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
    submitted: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    verified: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    on_the_way: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    assigned: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  const cls = colors[value] ?? "bg-white/5 text-neutral-400 border-white/10";
  return (
    <span className={`type-label inline-flex px-3 py-1.5 rounded-full border ${cls}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

export default function EmergencyRequestsPage() {
  const { role } = useRole();
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const { toast, showToast, dismiss } = useToast();
  const [requests, setRequests] = React.useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadRequests = React.useCallback(async () => {
    try {
      const res = await fetch("/api/emergency-requests");
      if (res.ok) setRequests(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 15000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const verifyRequest = async (id: string, code: string) => {
    const res = await fetch(`/api/emergency-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "VERIFIED" }),
    });
    if (res.ok) {
      showToast(`Verified ${code}`);
      loadRequests();
    }
  };

  const autoDispatch = async () => {
    const pending = requests.filter((r) => r.status === "VERIFIED" || r.status === "PENDING");
    const volRes = await fetch("/api/volunteers");
    const volunteers = volRes.ok ? await volRes.json() : [];
    const available = volunteers.find((v: { availability: string; status: string }) =>
      v.availability === "AVAILABLE" && v.status === "IDLE"
    );
    if (!pending.length || !available) {
      showToast("No pending requests or available volunteers");
      return;
    }
    const res = await fetch(`/api/volunteers/${available.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: pending[0].id }),
    });
    if (res.ok) {
      showToast(`Dispatched ${available.name} to ${pending[0].requestCode}`);
      loadRequests();
    }
  };

  const filtered = requests.filter((e) => {
    const urgency = priorityToUrgency(e.priority);
    if (filter === "critical") return urgency === "critical";
    if (filter === "active") return e.status !== "RESOLVED" && e.status !== "CANCELLED";
    if (search) {
      const q = search.toLowerCase();
      return (
        e.requestCode.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.emergencyType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    active: requests.filter((e) => e.status !== "RESOLVED" && e.status !== "CANCELLED").length,
    critical: requests.filter((e) => priorityToUrgency(e.priority) === "critical").length,
    enRoute: requests.filter((e) => e.status === "IN_PROGRESS").length,
    pending: requests.filter((e) => e.status === "PENDING").length,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Emergency Operations"
        icon={<Siren size={14} />}
        title="Active Requests"
        description="Real-time triage queue for incoming emergency reports."
        actions={
          <>
            <Link
              href="/get-help"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              <Zap size={15} /> New Request
            </Link>
            {role === "admin" && (
              <button
                type="button"
                onClick={autoDispatch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Auto-dispatch <ShieldCheck size={15} />
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Active", value: stats.active, color: "text-white" },
          { label: "Critical", value: stats.critical, color: "text-red-400" },
          { label: "On The Way", value: stats.enRoute, color: "text-blue-400" },
          { label: "Pending", value: stats.pending, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="ops-card p-5">
            <div className="report-section-title mb-2">{s.label}</div>
            <div className={`type-heading-l font-medium ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, location, type..."
            className="ops-input w-full pl-11"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "critical"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === f
                  ? f === "critical"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-neutral-500 border border-white/10 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="ops-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-neutral-500">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="ops-table w-full">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Type & Location</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const urgency = priorityToUrgency(e.priority);
                  const displayStatus = statusToDisplay(e.status);
                  return (
                    <tr key={e.id}>
                      <td>
                        <strong className="font-mono text-sm text-white">{e.requestCode}</strong>
                      </td>
                      <td>
                        <div className="font-medium text-white text-sm">{e.emergencyType}</div>
                        <div className="text-neutral-500 text-xs flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          {e.location}
                          {e.peopleAffected > 0 && ` · ${e.peopleAffected} affected`}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <HeartPulse size={14} className={urgency === "critical" ? "text-red-400" : "text-amber-400"} />
                          <span className={`capitalize text-sm font-medium ${urgency === "critical" ? "severity-pulse inline-flex px-2 py-0.5 rounded-full" : ""}`}>{urgency}</span>
                        </div>
                      </td>
                      <td><StatusBadge value={displayStatus} /></td>
                      <td className="text-neutral-500 text-sm">{timeAgo(e.createdAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link href={`/map?emergency=${e.id}`} className="ops-btn-ghost text-xs">
                            <ExternalLink size={13} /> Map
                          </Link>
                          <Link href={`/tracking?code=${e.requestCode}`} className="ops-btn-ghost text-xs">
                            Track
                          </Link>
                          {role === "admin" && e.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => verifyRequest(e.id, e.requestCode)}
                              className="ops-btn-primary text-xs"
                            >
                              Verify <CheckCircle2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length && (
                  <tr>
                    <td colSpan={6} className="text-center text-neutral-500 py-8">
                      No requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Toast message={toast} onDismiss={dismiss} />
    </div>
  );
}
