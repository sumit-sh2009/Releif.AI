"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/app/PageHeader";
import { Navigation, HeartPulse, ShieldCheck } from "lucide-react";
import { demoEmergencies, demoVolunteers } from "@/lib/demo-data";

const LiveMap = dynamic(() => import("@/components/app/LiveMap"), { ssr: false });

export default function MapPage() {
  return (
    <div className="flex flex-col -mx-6 -mt-6 sm:-mx-8" style={{ height: "calc(100vh - 70px)" }}>
      <div className="px-6 sm:px-8 pt-6 pb-4 flex items-end justify-between gap-4 shrink-0">
        <PageHeader
          eyebrow="Geospatial Intelligence"
          icon={<Navigation size={14} />}
          title="Live Map"
          description="Real-time view of active emergencies and volunteer positions."
        />
        <div className="hidden md:flex items-center gap-4 text-xs text-neutral-500 shrink-0 pb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            {demoEmergencies.length} incidents
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            {demoVolunteers.length} volunteers
          </span>
        </div>
      </div>
      <div className="flex-1 relative mx-6 sm:mx-8 mb-6 rounded-2xl overflow-hidden border border-white/10">
        <LiveMap />
      </div>
    </div>
  );
}
