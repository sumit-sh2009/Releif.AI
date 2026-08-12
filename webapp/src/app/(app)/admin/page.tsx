import * as React from "react";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
        <ShieldCheck size={32} />
      </div>
      <h1 className="type-heading-l font-semibold">Command Center</h1>
      <p className="text-on-surface-variant max-w-md">
        This is a restricted operational zone. Full administrative and system control interfaces will be implemented here.
      </p>
    </div>
  );
}
