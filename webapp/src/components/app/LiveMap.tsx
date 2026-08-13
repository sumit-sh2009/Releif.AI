"use client";
import * as React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, HeartPulse, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EmergencyRequest } from "@/types/emergency-request";
import type { Volunteer } from "@/types/volunteer";
import { priorityToUrgency, statusToDisplay } from "@/lib/format";
import { resolveCoords } from "@/lib/geo";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

function emergencyIconHtml(critical: boolean) {
  const ring = critical
    ? "box-shadow: 0 0 0 0 rgba(239,68,68,0.5); animation: map-radar-ping 2s ease-out infinite;"
    : "";
  return `<div class="map-emergency-pin" style="background-color: ${critical ? "#dc2626" : "#f97316"}; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); ${ring}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/></svg></div>`;
}

const volunteerIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg></div>`,
  className: "custom-leaflet-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DEFAULT_CENTER: [number, number] = [19.076, 72.877];

export default function LiveMap() {
  const router = useRouter();
  const [emergencies, setEmergencies] = React.useState<EmergencyRequest[]>([]);
  const [volunteers, setVolunteers] = React.useState<Volunteer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [reqRes, volRes] = await Promise.all([
          fetch("/api/emergency-requests"),
          fetch("/api/volunteers"),
        ]);
        if (reqRes.ok) setEmergencies(await reqRes.json());
        if (volRes.ok) setVolunteers(await volRes.json());
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  const activeEmergencies = React.useMemo(
    () => emergencies.filter((e) => e.status !== "RESOLVED" && e.status !== "CANCELLED"),
    [emergencies],
  );

  const emergencyCoords = React.useMemo(() => {
    const map = new Map<string, [number, number]>();
    for (const e of activeEmergencies) {
      map.set(e.id, resolveCoords(e.id, e.latitude, e.longitude, DEFAULT_CENTER));
    }
    return map;
  }, [activeEmergencies]);

  const center: [number, number] = React.useMemo(() => {
    const withCoords = activeEmergencies.find((e) => e.latitude && e.longitude);
    if (withCoords?.latitude && withCoords.longitude) {
      return [withCoords.latitude, withCoords.longitude];
    }
    return DEFAULT_CENTER;
  }, [activeEmergencies]);

  const dispatchRoutes = React.useMemo(() => {
    const routes: { id: string; path: [number, number][] }[] = [];
    for (const v of volunteers) {
      if (!v.latitude || !v.longitude || !v.currentRequestId) continue;
      const dest = emergencyCoords.get(v.currentRequestId);
      if (!dest) continue;
      routes.push({
        id: `${v.id}-${v.currentRequestId}`,
        path: [
          [v.latitude, v.longitude],
          dest,
        ],
      });
    }
    return routes;
  }, [volunteers, emergencyCoords]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full map-shell">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={tileUrl}
        />
        <ZoomControl position="bottomright" />

        {dispatchRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.path}
            pathOptions={{
              color: "#60a5fa",
              weight: 2,
              opacity: 0.85,
              dashArray: "8 6",
              className: "map-dispatch-route",
            }}
          />
        ))}

        {activeEmergencies.map((e) => {
          const coords = emergencyCoords.get(e.id)!;
          const urgency = priorityToUrgency(e.priority);
          const critical = urgency === "critical";
          const icon = new L.DivIcon({
            html: emergencyIconHtml(critical),
            className: "custom-leaflet-icon",
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          });

          return (
            <React.Fragment key={e.id}>
              {critical && (
                <CircleMarker
                  center={coords}
                  radius={18}
                  pathOptions={{
                    color: "rgba(239,68,68,0.35)",
                    fillColor: "rgba(239,68,68,0.08)",
                    fillOpacity: 0.4,
                    weight: 1,
                    className: "map-critical-zone",
                  }}
                />
              )}
              <Marker position={coords} icon={icon}>
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartPulse
                        size={16}
                        className={critical ? "text-red-500" : "text-orange-500"}
                      />
                      <strong className="type-body-sm font-semibold">{e.emergencyType}</strong>
                    </div>
                    <p className="text-sm mb-1">{e.location}</p>
                    <p className="text-xs text-on-surface-variant capitalize">
                      {statusToDisplay(e.status).replace("_", " ")} · {urgency}
                    </p>
                    <div className="mt-3">
                      <button
                        className="primary-button small w-full justify-center"
                        onClick={() => router.push("/emergency-requests")}
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {volunteers.map((v) =>
          v.latitude && v.longitude ? (
            <Marker key={v.id} position={[v.latitude, v.longitude]} icon={volunteerIcon}>
              <Popup>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={16} className="text-blue-500" />
                    <strong>{v.name}</strong>
                  </div>
                  <p className="text-xs capitalize">
                    {v.status.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="ops-glass-card p-4 pointer-events-auto w-72">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-[var(--ops-text)]">
            <MapPin size={16} /> Live Region
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--ops-text-muted)] flex items-center gap-1">
                <HeartPulse size={14} /> Active incidents
              </span>
              <strong className="text-red-500">{activeEmergencies.length}</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--ops-text-muted)] flex items-center gap-1">
                <ShieldCheck size={14} /> Volunteers deployed
              </span>
              <strong className="text-blue-400">
                {volunteers.filter((v) => v.status !== "IDLE").length}
              </strong>
            </div>
            {dispatchRoutes.length > 0 && (
              <div className="pt-2 border-t border-white/10 text-xs text-blue-300/80">
                {dispatchRoutes.length} active dispatch route
                {dispatchRoutes.length !== 1 ? "s" : ""} on map
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
