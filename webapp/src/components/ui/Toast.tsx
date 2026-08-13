"use client";

import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 ops-glass-card px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 p-1 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
