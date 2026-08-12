"use client";
import * as React from "react";
import { ChevronRight, MapPin, Waves, Droplets, Siren, AlertTriangle, Users, ShieldCheck, Layers3, HeartPulse, Activity, Navigation, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EmergencyRequest } from "@/types/emergency-request";
import type { Volunteer } from "@/types/volunteer";
import type { PredictionResult } from "@/types/prediction";
import { priorityToUrgency, statusToDisplay, timeAgo } from "@/lib/format";

function StatusBadge({ value }: { value: string }) {
  return <span className={`status-badge ${value}`}>{value.replace(/_/g, " ")}</span>;
}
function Stat({ label, value, detail, icon, alert }: { label: string; value: string | number; detail: string; icon: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`stat-card ${alert ? "stat-alert" : ""}`}>
      <div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div>
      <strong>{value}</strong><small>{detail}</small>
    </div>
  );
}
function RiskCard({ prediction }: { prediction: PredictionResult }) {
  return (
    <div className="risk-card">
      <div className="risk-top">
        <div>
          <div className="eyebrow deep-red">PREDICTED RISK</div>
          <h3>{prediction.probability}% <span>{prediction.disasterType}</span></h3>
        </div>
        <div className="risk-ring"><span>{prediction.probability}%</span></div>
      </div>
      <div className="risk-bar"><span style={{ width: `${prediction.probability}%` }} /></div>
      <div className="risk-footer">
        <span><AlertTriangle size={14} /> High confidence warning</span>
        <span>{timeAgo(prediction.createdAt)}</span>
      </div>
    </div>
  );
}
function Progress({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="progress-item">
      <div><span>{label}</span><strong>{value}%</strong></div>
      <div className="progress-track"><span className={color} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function DashboardHome() {
  const router = useRouter();
  const [emergencies, setEmergencies] = React.useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = React.useState<Volunteer[]>([]);
  const [prediction, setPrediction] = React.useState<PredictionResult | null>(null);
  const [activity, setActivity] = React.useState<{ message: string; createdAt: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [reqRes, volRes, predRes, actRes] = await Promise.all([
          fetch("/api/emergency-requests"),
          fetch("/api/volunteers"),
          fetch("/api/predictions"),
          fetch("/api/activity"),
        ]);
        if (reqRes.ok) setEmergencies(await reqRes.json());
        if (volRes.ok) setVolunteers(await volRes.json());
        if (predRes.ok) {
          const preds = await predRes.json();
          if (preds.length) setPrediction(preds[0]);
        }
        if (actRes.ok) setActivity(await actRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  const counts = React.useMemo(() => ({
    active: emergencies.filter((e) => e.status !== "RESOLVED" && e.status !== "CANCELLED").length,
    critical: emergencies.filter((e) => priorityToUrgency(e.priority) === "critical" && e.status !== "RESOLVED").length,
    people: emergencies.reduce((a, e) => a + e.peopleAffected, 0),
    volunteers: volunteers.filter((v) => v.availability === "AVAILABLE" && v.status === "IDLE").length,
  }), [emergencies, volunteers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-500">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="live-dot" /> LIVE OPERATIONS</div>
          <h1>Sector Overview</h1>
          <p>Real-time situational awareness and resource allocation matrix.</p>
        </div>
      </div>

      <section className="overview-grid">
        <div className="overview-card">
          <div>
            <div className="eyebrow red-text"><span className="pulse-dot" /> ACTIVE DISASTER</div>
            <h2>{prediction?.disasterType ?? "Monitoring"} Event</h2>
            <p className="location">
              <MapPin size={15} /> {prediction?.location ?? "All sectors"}
              {prediction && <StatusBadge value={prediction.severity.toLowerCase()} />}
            </p>
            <div className="overview-facts">
              <span><Waves size={15} /> {counts.active} active requests</span>
              <span><Droplets size={15} /> {counts.people} people affected</span>
              <span><MapPin size={15} /> {volunteers.length} responders</span>
            </div>
          </div>
          <button className="primary-button" onClick={() => router.push("/prediction")}>
            View prediction <ChevronRight size={16} />
          </button>
        </div>
        {prediction ? <RiskCard prediction={prediction} /> : (
          <div className="risk-card flex items-center justify-center text-neutral-500">
            Run a prediction to see risk analysis
          </div>
        )}
      </section>

      <div className="stats-grid">
        <Stat label="ACTIVE EMERGENCIES" value={counts.active} detail="Live from database" icon={<Siren size={17} />} alert />
        <Stat label="CRITICAL" value={counts.critical} detail="Requires command attention" icon={<AlertTriangle size={17} />} alert />
        <Stat label="PEOPLE AFFECTED" value={counts.people.toLocaleString()} detail="Across active sectors" icon={<Users size={17} />} />
        <Stat label="AVAILABLE VOLUNTEERS" value={counts.volunteers} detail="Ready for dispatch" icon={<ShieldCheck size={17} />} />
      </div>

      <section className="dashboard-grid">
        <div className="alert-panel">
          <div className="alert-icon"><AlertTriangle size={20} /></div>
          <div>
            <div className="eyebrow red-text">OPERATIONS STATUS</div>
            <h3>{counts.critical} critical requests need attention</h3>
            <p>Review the emergency queue and dispatch available responders to verified requests.</p>
            <button className="text-button" onClick={() => router.push("/emergency-requests")}>
              Open queue <ChevronRight size={15} />
            </button>
          </div>
        </div>
        <div className="resource-card card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">RESOURCE FLOW</div>
              <h3>Distribution matrix</h3>
            </div>
            <Layers3 size={18} />
          </div>
          <Progress label="Medical supplies" value={82} color="red" />
          <Progress label="Clean water" value={45} color="blue" />
          <Progress label="Emergency rations" value={68} color="green" />
        </div>
      </section>

      <section className="dashboard-grid lower-grid">
        <div className="card triage-card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">PRIORITY QUEUE</div>
              <h3>Severity triage</h3>
            </div>
            <button className="ghost-button" onClick={() => router.push("/emergency-requests")}>
              View all <ChevronRight size={15} />
            </button>
          </div>
          {emergencies.slice(0, 3).map((e) => {
            const urgency = priorityToUrgency(e.priority);
            return (
              <button className="triage-row" key={e.id} onClick={() => router.push(`/map?emergency=${e.id}`)}>
                <div className={`triage-marker ${urgency}`} aria-hidden><HeartPulse size={16} /></div>
                <div className="triage-copy">
                  <strong>{e.emergencyType}</strong>
                  <span>{e.location} · {timeAgo(e.createdAt)} · {e.peopleAffected} people</span>
                </div>
                <div className="severity-score">
                  {urgency === "critical" ? "9.3" : urgency === "urgent" ? "7.4" : "6.2"}
                  <small>severity</small>
                </div>
                <ChevronRight size={16} className="shrink-0 opacity-50" />
              </button>
            );
          })}
        </div>
        <div className="card activity-card">
          <div className="card-heading">
            <div>
              <div className="eyebrow">REALTIME FEED</div>
              <h3>Activity</h3>
            </div>
            <Activity size={18} />
          </div>
          {activity.slice(0, 4).map((x, i) => (
            <div className="activity-row" key={x.message + i}>
              <span className="activity-line" data-tone={String(i)} aria-hidden />
              <div className="activity-body">
                <strong>{x.message}</strong>
                <small>{new Date(x.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · System event</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card request-table">
        <div className="card-heading">
          <div>
            <div className="eyebrow">LIVE REQUESTS</div>
            <h3>Recent emergency requests</h3>
          </div>
          <button className="ghost-button" onClick={() => router.push("/map")}>
            Open live map <Navigation size={15} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>REQUEST</th><th>TYPE</th><th>LOCATION</th><th>PRIORITY</th><th>STATUS</th><th>REPORTED</th></tr>
            </thead>
            <tbody>
              {emergencies.slice(0, 5).map((e) => (
                <tr key={e.id} onClick={() => router.push(`/map?emergency=${e.id}`)}>
                  <td><strong>{e.requestCode}</strong></td>
                  <td>{e.emergencyType}</td>
                  <td><span className="table-cell-icon"><MapPin size={14} /><span className="truncate">{e.location}</span></span></td>
                  <td><StatusBadge value={priorityToUrgency(e.priority)} /></td>
                  <td><StatusBadge value={statusToDisplay(e.status)} /></td>
                  <td>{timeAgo(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
