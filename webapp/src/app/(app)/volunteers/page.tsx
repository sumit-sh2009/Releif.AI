"use client";
import * as React from "react";
import { Search, Filter, ShieldCheck, MapPin, Users, HeartPulse, ChevronDown, Loader2 } from "lucide-react";
import { useRole } from "@/components/app/RoleContext";
import type { Volunteer } from "@/types/volunteer";
import type { EmergencyRequest } from "@/types/emergency-request";

function StatusBadge({ value }: { value: string }) {
  const label = value === "AVAILABLE" ? "available" : value === "UNAVAILABLE" ? "on_mission" : value.toLowerCase();
  return <span className={`status-badge ${label}`}>{label.replace("_", " ")}</span>;
}

export default function VolunteersPage() {
  const { role } = useRole();
  const [filter, setFilter] = React.useState("all");
  const [volunteers, setVolunteers] = React.useState<Volunteer[]>([]);
  const [requests, setRequests] = React.useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const [volRes, reqRes] = await Promise.all([
        fetch("/api/volunteers"),
        fetch("/api/emergency-requests"),
      ]);
      if (volRes.ok) setVolunteers(await volRes.json());
      if (reqRes.ok) setRequests(await reqRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const dispatch = async (volunteerId: string) => {
    const pending = requests.find((r) => r.status === "VERIFIED" || r.status === "PENDING");
    if (!pending) {
      setToast("No pending requests to assign");
      return;
    }
    const res = await fetch(`/api/volunteers/${volunteerId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: pending.id }),
    });
    if (res.ok) {
      setToast("Volunteer dispatched");
      load();
    }
  };

  const filtered = volunteers.filter((v) => {
    if (filter === "available") return v.availability === "AVAILABLE" && v.status === "IDLE";
    if (filter === "on_mission") return v.status === "ON_MISSION" || v.status === "ASSIGNED";
    return true;
  });

  return (
    <div className="table-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><Users size={14} /> PERSONNEL</div>
          <h1>Volunteer Roster</h1>
          <p>Manage and dispatch available response units.</p>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input placeholder="Search name or skills..." />
        </div>
        <div className="filter-group">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
          <button className={filter === "available" ? "active" : ""} onClick={() => setFilter("available")}>Available</button>
          <button className={filter === "on_mission" ? "active" : ""} onClick={() => setFilter("on_mission")}>On Mission</button>
        </div>
        <button className="ghost-button"><Filter size={15} /> Filters</button>
      </div>

      <div className="card table-wrap">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 size={24} className="animate-spin" /></div>
        ) : (
          <table>
            <thead>
              <tr><th>PERSONNEL</th><th>SKILLS</th><th>LOCATION</th><th>STATUS</th><th>ACTIONS</th></tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div className="triage-copy">
                      <strong>{v.name}</strong>
                      <span>ID: {v.id.toUpperCase()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {v.skills.map((s) => (
                        <span key={s} className="status-badge" style={{ background: "var(--surface-container-high)", color: "var(--on-surface)", border: "none" }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <MapPin size={13} />{" "}
                    {v.latitude ? `${v.latitude.toFixed(3)}, ${v.longitude?.toFixed(3)}` : v.location}
                  </td>
                  <td><StatusBadge value={v.availability} /></td>
                  <td>
                    <div className="action-cell">
                      <button className="ghost-button small">Profile</button>
                      {role === "admin" && v.availability === "AVAILABLE" && v.status === "IDLE" && (
                        <button className="primary-button small" onClick={() => dispatch(v.id)}>
                          Dispatch
                        </button>
                      )}
                      <button className="icon-button"><ChevronDown size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-5 py-3 rounded-full text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
