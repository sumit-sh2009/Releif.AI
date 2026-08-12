"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyMountProps {
  children: ReactNode;
  /** Placeholder height to prevent layout shift while deferred */
  minHeight?: string;
  /** How far ahead of viewport to mount (default 300px) */
  rootMargin?: string;
  className?: string;
}

/**
 * Defers mounting children until the section is near the viewport.
 * Keeps heavy animation trees out of memory until needed.
 */
export function LazyMount({
  children,
  minHeight,
  rootMargin = "300px",
  className,
}: LazyMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setTimeout(() => setMounted(true), 0);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={!mounted && minHeight ? { minHeight } : undefined}
    >
      {mounted ? children : null}
    </div>
  );
}
