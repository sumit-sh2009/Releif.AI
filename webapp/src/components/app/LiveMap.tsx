"use client";
import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "@/components/ThemeProvider";
import { MapPin, HeartPulse, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EmergencyRequest } from "@/types/emergency-request";
import type { Volunteer } from "@/types/volunteer";
import { priorityToUrgency, statusToDisplay } from "@/lib/format";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const emergencyIcon = new L.DivIcon({
  html: `<div style="background-color: #ef4444; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"/></svg></div>`,
  className: "custom-leaflet-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const volunteerIcon = new L.DivIcon({
  html: `<div style="background-color: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg></div>`,
  className: "custom-leaflet-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DEFAULT_CENTER: [number, number] = [19.076, 72.877];

export default function LiveMap() {
  const { theme } = useTheme();
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

  const tileUrl = theme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const activeEmergencies = emergencies.filter(
    (e) => e.status !== "RESOLVED" && e.status !== "CANCELLED"
  );

  const center: [number, number] = activeEmergencies.find((e) => e.latitude && e.longitude)
    ? [activeEmergencies.find((e) => e.latitude)!.latitude!, activeEmergencies.find((e) => e.longitude)!.longitude!]
    : DEFAULT_CENTER;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
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

        {activeEmergencies.map((e) => {
          const lat = e.latitude ?? center[0] + (Math.random() - 0.5) * 0.02;
          const lng = e.longitude ?? center[1] + (Math.random() - 0.5) * 0.02;
          const urgency = priorityToUrgency(e.priority);
          return (
            <Marker key={e.id} position={[lat, lng]} icon={emergencyIcon}>
              <Popup className="custom-popup">
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse size={16} className={urgency === "critical" ? "text-red-500" : "text-orange-500"} />
                    <strong className="type-body-sm font-semibold">{e.emergencyType}</strong>
                  </div>
                  <p className="text-sm mb-1">{e.location}</p>
                  <p className="text-xs text-on-surface-variant capitalize">
                    {statusToDisplay(e.status).replace("_", " ")} · {urgency}
                  </p>
                  <div className="mt-3">
                    <button className="primary-button small w-full justify-center" onClick={() => router.push("/emergency-requests")}>
                      View details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
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
                  <p className="text-xs capitalize">{v.status.toLowerCase().replace("_", " ")}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>

      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl pointer-events-auto w-72">
          <h3 className="font-bold mb-3 flex items-center gap-2 text-white"><MapPin size={16} /> Live Region</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant flex items-center gap-1"><HeartPulse size={14} /> Active incidents</span>
              <strong className="text-red-500">{activeEmergencies.length}</strong>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant flex items-center gap-1"><ShieldCheck size={14} /> Volunteers deployed</span>
              <strong className="text-blue-500">{volunteers.filter((v) => v.status !== "IDLE").length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
