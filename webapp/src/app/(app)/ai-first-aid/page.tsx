"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  BrainCircuit, Loader2, Send, AlertTriangle, CheckCircle2, Shield,
} from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import type { FirstAidResponse } from "@/types/first-aid";

export default function AIFirstAidPage() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FirstAidResponse | null>(null);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/first-aid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyDescription: description }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI Centre unavailable");
    } finally {
      setLoading(false);
    }
  }

  const urgencyColor: Record<string, string> = {
    CRITICAL: "text-red-400 bg-red-500/15 border-red-500/30",
    HIGH: "text-orange-400 bg-orange-500/15 border-orange-500/30",
    MEDIUM: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    LOW: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI Centre · Ollama llama3.2"
        icon={<BrainCircuit size={14} />}
        title="AI First Aid Guidance"
        description="Describe an emergency situation and get AI-powered first aid steps. Powered by AI Centre on port 7860."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <form onSubmit={submit} className="ops-card p-6">
          <label className="report-section-title block mb-4">
            Describe the emergency
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Person has a deep cut on their arm and is bleeding heavily..."
            rows={6}
            className="ops-input w-full resize-none mb-5 min-h-[160px]"
            required
          />
          <div className="flex flex-wrap gap-2 mb-5">
            {["Bleeding wound", "Burn injury", "Person unconscious", "Flood trapped"].map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setDescription(ex)}
                className="type-caption px-3 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:border-white/20 transition-[color,border-color] duration-[var(--duration-fast)] ease-[var(--ease-premium)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
              >
                {ex}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-400 type-body-sm font-semibold hover:bg-red-500/30 transition-[background,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-premium)] disabled:opacity-40 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {loading ? "AI is analyzing..." : "Get AI Guidance"}
          </button>
          {error && (
            <div className="mt-4 text-sm text-amber-400 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}. Start AI Centre: <code className="text-xs">./scripts/start-all.sh</code></span>
            </div>
          )}
        </form>

        {/* Results */}
        <div>
          {!result && !loading && (
            <div className="ops-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <Shield size={40} className="text-neutral-700 mb-4" />
              <p className="text-neutral-500 text-sm max-w-xs">
                Enter an emergency description to receive AI-generated first aid steps from the disaster management engine.
              </p>
            </div>
          )}

          {loading && (
            <div className="ops-card p-12 flex flex-col items-center justify-center gap-4 h-full min-h-[300px]">
              <BrainCircuit size={40} className="text-red-400 animate-pulse" />
              <p className="text-neutral-400 text-sm">Querying AI Centre (Ollama llama3.2)...</p>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <div className="ops-card p-5 flex items-center justify-between">
                <span className="report-section-title mb-0">Urgency Level</span>
                <span className={`type-label px-3 py-1.5 rounded-full border ${urgencyColor[result.urgencyLevel] ?? urgencyColor.HIGH}`}>
                  {result.urgencyLevel}
                </span>
              </div>

              <div className="ops-card p-6">
                <h3 className="report-section-title text-emerald-400 mb-5 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Immediate Steps
                </h3>
                <ol className="space-y-4">
                  {result.immediateSteps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3 type-body-sm text-neutral-300">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {result.thingsToAvoid.length > 0 && (
                <div className="ops-card p-6">
                  <h3 className="report-section-title text-red-400 mb-5 flex items-center gap-2">
                    <AlertTriangle size={14} /> Do Not
                  </h3>
                  <ul className="space-y-3">
                    {result.thingsToAvoid.map((item) => (
                      <li key={item} className="type-body-sm text-neutral-400 flex items-start gap-2">
                        <span className="text-red-400 shrink-0">×</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ops-card p-5 type-caption text-neutral-500 leading-relaxed">
                <strong className="text-neutral-400 font-semibold">When to seek professional help:</strong>{" "}
                {result.whenToSeekProfessionalHelp}
              </div>

              <p className="type-overline text-neutral-700 text-center leading-relaxed">{result.safetyDisclaimer}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
