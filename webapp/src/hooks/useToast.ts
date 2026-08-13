"use client";

import * as React from "react";

const DEFAULT_DURATION_MS = 4000;

export function useToast(durationMs = DEFAULT_DURATION_MS) {
  const [toast, setToast] = React.useState("");
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast("");
  }, []);

  const showToast = React.useCallback(
    (message: string) => {
      dismiss();
      setToast(message);
      timerRef.current = setTimeout(() => {
        setToast("");
        timerRef.current = null;
      }, durationMs);
    },
    [dismiss, durationMs],
  );

  React.useEffect(() => dismiss, [dismiss]);

  return { toast, showToast, dismiss };
}
