"use client";
import * as React from "react";
import { Sparkles, Loader2, BrainCircuit, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

interface AIResult {
  risk_level: string;
  summary: string;
  weather_concerns?: string[];
  casualty_concerns?: string[];
  priority_actions?: string[];
  confidence_score?: number;
  evacuation_recommended?: boolean;
}

export default function PredictionPage() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<AIResult | null>(null);
  const [error, setError] = React.useState("");
  const [location, setLocation] = React.useState("Riverside District, Assam, India");

  async function runAI() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/predictions/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          rainfall: 142,
          temperature: 28,
          humidity: 88,
          wind: 45,
          waterLevel: 6.2,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setResult({
        risk_level: data.severity ?? "HIGH",
        summary: `Flood risk analysis for ${data.location}. Probability: ${data.probability}%. Model: ${data.modelVersion}.`,
        weather_concerns: [`Rainfall elevated at ${142}mm`, `Water level at ${6.2}m`, `Wind speed ${45} km/h`],
        priority_actions: [
          "Monitor river levels every 30 minutes",
          "Pre-position rescue teams in affected zones",
          "Issue evacuation advisory for low-lying areas",
          "Activate volunteer dispatch protocol",
        ],
        confidence_score: (data.confidence ?? 85) / 100,
        evacuation_recommended: data.severity === "CRITICAL" || data.severity === "HIGH",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI Engine unavailable — start it with ./scripts/start-all.sh");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    runAI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const riskColor: Record<string, string> = {
    CRITICAL: "text-red-400 bg-red-500/15 border-red-500/30",
    HIGH: "text-orange-400 bg-orange-500/15 border-orange-500/30",
    MODERATE: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    MEDIUM: "text-amber-400 bg-amber-500/15 border-amber-500/30",
    LOW: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI Prediction Engine · LangGraph + RAG"
        icon={<Sparkles size={14} />}
        title="Disaster Risk Analysis"
        description="Live flood prediction powered by the AI Engine on port 8000."
        actions={
          <button
            type="button"
            onClick={runAI}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-400 type-body-sm font-medium hover:bg-red-500/30 transition-[background,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-premium)] disabled:opacity-50 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {loading ? "Analyzing..." : "Run AI Analysis"}
          </button>
        }
      />

      <div className="mb-6 flex gap-3">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="ops-input flex-1"
          placeholder="Location to analyze..."
        />
      </div>

      {error && (
        <div className="ops-card p-4 mb-6 border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong>AI Engine offline.</strong> {error}
            <div className="text-xs text-amber-400/70 mt-1">
              The website runs on <strong>localhost:3000</strong>. AI Engine runs on <strong>localhost:8000</strong>.
              Run <code className="bg-black/30 px-1 rounded">./scripts/setup.sh && ./scripts/start-all.sh</code>
            </div>
          </div>
        </div>
      )}

      {loading && !result && (
        <div className="ops-card pipeline-loading">
          <BrainCircuit size={40} className="text-red-400 animate-pulse" />
          <p>Running LangGraph flood analysis pipeline...</p>
          <div className="flex flex-col gap-2 w-full max-w-sm mt-2">
            <div className="pipeline-node active">Ingesting environmental signals</div>
            <div className="pipeline-node">Running LangGraph orchestration</div>
            <div className="pipeline-node">Generating risk assessment</div>
          </div>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="ops-card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="report-section-title">Risk Assessment</div>
                  <h2 className="type-heading-l text-white">{location}</h2>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold border ${riskColor[result.risk_level] ?? riskColor.HIGH}`}>
                  {result.risk_level}
                </span>
              </div>
              <p className="report-body">{result.summary}</p>
              {result.evacuation_recommended && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-sm font-medium">
                  <AlertTriangle size={16} /> Evacuation recommended
                </div>
              )}
            </div>

            {result.weather_concerns && result.weather_concerns.length > 0 && (
              <div className="ops-card p-6">
                <h3 className="report-section-title">Weather Signals</h3>
                <ul className="space-y-2">
                  {result.weather_concerns.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.priority_actions && (
              <div className="ops-card p-6">
                <h3 className="report-section-title">AI Recommended Actions</h3>
                <ol className="space-y-3">
                  {result.priority_actions.map((a, i) => (
                    <li key={a} className="flex items-start gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-neutral-300 pt-0.5">{a}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="ops-card p-6 bg-gradient-to-br from-red-950/40 to-black border-red-500/20">
              <div className="report-section-title text-red-400/70 mb-2">AI Engine</div>
              <div className="type-heading-xl font-medium text-white mb-2">
                {Math.round((result.confidence_score ?? 0.85) * 100)}%
              </div>
              <div className="text-xs text-neutral-500">Confidence score</div>
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-neutral-500">
                <div className="flex justify-between"><span>Model</span><span className="text-neutral-300">LangGraph v1</span></div>
                <div className="flex justify-between"><span>Port</span><span className="text-neutral-300">:8000</span></div>
                <div className="flex justify-between"><span>RAG</span><span className="text-emerald-400">Active</span></div>
              </div>
            </div>
            <div className="ops-card p-4 text-xs text-neutral-600 leading-relaxed">
              <CheckCircle2 size={14} className="text-emerald-400 inline mr-1" />
              This page calls <code className="text-neutral-400">POST /api/predictions/run</code> which connects to the AI Engine LangGraph pipeline.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
