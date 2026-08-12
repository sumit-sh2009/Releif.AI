import { Suspense } from "react";
import TrackingContent from "./TrackingContent";

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="type-body text-[var(--text-muted)] py-24 text-center">
          Loading…
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
