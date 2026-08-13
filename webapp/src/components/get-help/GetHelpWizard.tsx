"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Home,
  Loader2,
  MapPin,
  Phone,
  Shield,
  Siren,
  Users,
  Utensils,
  Zap,
} from "lucide-react";

type Urgency = "critical" | "urgent" | "standard";
type EmergencyType =
  | "Medical Assistance"
  | "Rescue / Evacuation"
  | "Shelter Needed"
  | "Food & Water"
  | "Other Emergency";

const EMERGENCY_TYPES: {
  id: EmergencyType;
  label: string;
  description: string;
  icon: typeof HeartPulse;
}[] = [
  {
    id: "Medical Assistance",
    label: "Medical",
    description: "Injury, illness, or medical emergency",
    icon: HeartPulse,
  },
  {
    id: "Rescue / Evacuation",
    label: "Rescue",
    description: "Trapped, stranded, or need evacuation",
    icon: Siren,
  },
  {
    id: "Shelter Needed",
    label: "Shelter",
    description: "Displaced and need safe accommodation",
    icon: Home,
  },
  {
    id: "Food & Water",
    label: "Supplies",
    description: "Food, water, or essential supplies",
    icon: Utensils,
  },
  {
    id: "Other Emergency",
    label: "Other",
    description: "Any other urgent situation",
    icon: Droplets,
  },
];

const URGENCIES: {
  id: Urgency;
  label: string;
  description: string;
  color: string;
}[] = [
  {
    id: "critical",
    label: "Critical",
    description: "Life-threatening — immediate response",
    color: "border-red-500/50 bg-red-500/10 text-red-400",
  },
  {
    id: "urgent",
    label: "Urgent",
    description: "Serious — help needed within hours",
    color: "border-amber-500/50 bg-amber-500/10 text-amber-400",
  },
  {
    id: "standard",
    label: "Standard",
    description: "Important — can wait for assignment",
    color: "border-[var(--border-default)] bg-[var(--citizen-surface)] text-[var(--text-secondary)]",
  },
];

const STEPS = ["Emergency", "Details", "Verify", "Confirmed"];
const STEP_MOTION = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

function urgencyToPriority(urgency: Urgency) {
  if (urgency === "critical") return "CRITICAL";
  if (urgency === "urgent") return "HIGH";
  return "MEDIUM";
}

export default function GetHelpWizard() {
  const [step, setStep] = useState(0);
  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const [location, setLocation] = useState("");
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestCode, setRequestCode] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  const canProceedStep0 = emergencyType && urgency;
  const canProceedStep1 = location.trim().length >= 3 && description.trim().length >= 10;
  const canProceedStep2 = phone.length >= 10 && (!otpSent || otp.length === 6);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`);
          setDetectingLocation(false);
        },
        () => {
          setLocation("Riverside District, Assam, India");
          setDetectingLocation(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocation("Riverside District, Assam, India");
      setDetectingLocation(false);
    }
  };

  const submitRequest = async () => {
    if (!emergencyType || !urgency) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/emergency-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emergencyType,
          description: `[${urgency.toUpperCase()}] ${description}`,
          location,
          priority: urgencyToPriority(urgency),
          requesterPhone: phone,
          peopleAffected,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit request");
      }

      const created = await res.json();
      setRequestCode(created.requestCode);
      setStep(3);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sendOtp = () => {
    if (phone.length < 10) return;
    setOtpSent(true);
  };

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center type-caption font-semibold transition-all duration-500 ${
                  i < step
                    ? "bg-red-500 text-white"
                    : i === step
                      ? "bg-red-500/20 border border-red-400/50 text-red-400"
                      : "wizard-step-idle"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`type-overline hidden sm:block ${
                  i <= step ? "text-[var(--text-muted)]" : "text-[var(--text-disabled)]"
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-px wizard-progress-track relative">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-400"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0 — Emergency type & urgency */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={STEP_MOTION}
          >
            <div className="text-center mb-8">
              <p className="type-overline text-red-400/90 mb-3">Step 1 · Emergency type</p>
              <h2 className="type-heading-l wizard-heading mb-2">What do you need?</h2>
              <p className="type-body text-[var(--text-secondary)]">
                Select the type of help and how urgent it is.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {EMERGENCY_TYPES.map(({ id, label, description, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setEmergencyType(id)}
                  className={`group relative p-4 rounded-2xl text-left transition-all duration-300 min-h-[48px] wizard-choice ${
                    emergencyType === id ? "is-selected" : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-3 transition-colors wizard-choice-icon ${
                      emergencyType === id ? "" : ""
                    }`}
                  />
                  <div className="font-medium text-sm">{label}</div>
                  <div className="wizard-choice-desc text-xs mt-1 leading-snug hidden sm:block">
                    {description}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="wizard-section-label mb-4">
                Urgency Level
              </div>
              <div className="flex flex-col gap-3">
                {URGENCIES.map(({ id, label, description, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setUrgency(id)}
                    className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 min-h-[48px] wizard-choice ${
                      urgency === id ? `is-selected ${color}` : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        id === "critical"
                          ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                          : id === "urgent"
                            ? "bg-amber-500"
                            : "bg-neutral-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium text-sm">{label}</div>
                      <div className="wizard-choice-desc text-xs mt-0.5">{description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!canProceedStep0}
              onClick={() => setStep(1)}
              className="w-full citizen-btn-primary wizard-primary-btn disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {/* Step 1 — Location & details */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={STEP_MOTION}
          >
            <div className="text-center mb-10">
              <h2 className="type-heading-l wizard-heading mb-3">
                Where are you?
              </h2>
              <p className="type-body text-[var(--text-secondary)]">
                Help us locate you so responders can reach you faster.
              </p>
            </div>

            <div className="space-y-8 mb-10">
              <div>
                <label className="citizen-label">
                  Location
                </label>
                <div className="input-with-icon">
                  <span className="input-icon" aria-hidden>
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Address, landmark, or area name"
                    className="w-full wizard-field citizen-input"
                  />
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLocation}
                  className="mt-4 flex items-center gap-2.5 type-body-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {detectingLocation ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 shrink-0" />
                  )}
                  {detectingLocation ? "Detecting..." : "Use my current location"}
                </button>
              </div>

              <div>
                <label className="citizen-label">
                  People Affected
                </label>
                <div className="flex items-center gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl wizard-icon-chip">
                    <Users className="w-4 h-4" />
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(Number(e.target.value))}
                    className="min-w-0 flex-1 accent-red-500"
                  />
                  <span className="type-heading-m w-10 shrink-0 text-center tabular-nums">
                    {peopleAffected}
                  </span>
                </div>
              </div>

              <div>
                <label className="citizen-label">
                  Describe the situation
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us what's happening — the more detail, the better we can help..."
                  rows={4}
                  className="w-full px-4 py-3 wizard-field citizen-input resize-none"
                />
                <p className="citizen-helper">
                  Minimum 10 characters · {description.length}/500
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="wizard-back-btn px-6 py-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="flex-1 citizen-btn-primary wizard-primary-btn disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Phone verification */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={STEP_MOTION}
          >
            <div className="text-center mb-10">
              <h2 className="type-heading-l wizard-heading mb-3">
                Verify your number
              </h2>
              <p className="type-body text-[var(--text-secondary)]">
                We&apos;ll send updates about your request to this number.
              </p>
            </div>

            <div className="p-6 rounded-2xl wizard-summary mb-6">
              <div className="flex items-center gap-3 type-overline wizard-summary-label mb-4">
                <Shield className="w-4 h-4" />
                Request Summary
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="wizard-summary-label text-xs mb-1">Type</div>
                  <div className="font-medium">{emergencyType}</div>
                </div>
                <div>
                  <div className="wizard-summary-label text-xs mb-1">Urgency</div>
                  <div
                    className={`font-medium capitalize ${
                      urgency === "critical"
                        ? "text-red-400"
                        : urgency === "urgent"
                          ? "text-amber-400"
                          : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {urgency}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="wizard-summary-label text-xs mb-1">Location</div>
                  <div className="font-medium">{location}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5 mb-10">
              <div>
                <label className="citizen-label">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="input-with-icon flex-1 min-w-0">
                    <span className="input-icon" aria-hidden>
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))}
                      placeholder="+91 98765 43210"
                      className="w-full wizard-field citizen-input"
                    />
                  </div>
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={phone.length < 10}
                      className="shrink-0 px-5 py-4 rounded-xl wizard-back-btn type-body-sm font-medium tracking-wide hover:border-red-400/40 hover:text-red-500 transition-all disabled:opacity-30 min-h-[48px]"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="citizen-label">
                    Enter 6-digit code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="• • • • • •"
                    maxLength={6}
                    className="w-full px-4 py-4 wizard-field citizen-input text-center text-2xl tracking-[0.5em] type-mono"
                  />
                  <p className="citizen-helper text-center">
                    Demo mode — enter any 6 digits to verify
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="wizard-back-btn px-6 py-4 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                disabled={!canProceedStep2 || submitting}
                onClick={submitRequest}
                className="flex-1 citizen-btn-primary wizard-primary-btn disabled:opacity-30 disabled:cursor-not-allowed gap-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <Zap className="w-5 h-5 shrink-0" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-20 rounded-full bg-red-500/10 border border-red-400/30 flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle2 className="w-10 h-10 text-red-400" />
            </motion.div>

            <div className="text-red-400 type-overline mb-4">
              Request received
            </div>
            <h2 className="type-display wizard-heading mb-3">
              Help is on the way.
            </h2>
            <p className="type-body-lg text-[var(--text-secondary)] mb-10 prose-width-narrow mx-auto">
              Your request has been logged. Save your ID to track status and receive updates.
            </p>

            <div className="inline-flex flex-col items-center wizard-code-box px-12 py-8 rounded-2xl mb-10">
              <p className="type-overline text-[var(--text-muted)] mb-2">
                Your Request ID
              </p>
              <p className="type-mono text-3xl md:text-4xl wizard-code-value">
                {requestCode}
              </p>
            </div>

            {/* Status timeline */}
            <div className="flex items-center justify-between max-w-md mx-auto mb-10 px-2">
              {["Created", "Verified", "Matched", "En Route"].map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-2 relative">
                  {i > 0 && (
                    <div className="absolute right-1/2 top-1.5 w-full h-px wizard-timeline-line -translate-y-1/2 -z-10" style={{ width: "calc(100% + 1rem)", left: "-50%" }} />
                  )}
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      i === 0
                        ? "bg-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                        : "wizard-timeline-dot-idle border-2"
                    }`}
                  />
                  <span
                    className={`type-overline ${
                      i === 0 ? "wizard-timeline-label-active" : "wizard-timeline-label-idle"
                    }`}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/tracking?code=${requestCode}`} className="citizen-btn-primary">
                Track request
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/" className="citizen-btn-secondary">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
