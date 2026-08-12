"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react";

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  rootMargin?: string;
}

/**
 * Memory-efficient video: loads src only when near viewport,
 * pauses when off-screen or tab is hidden.
 */
export const LazyVideo = forwardRef<HTMLVideoElement, LazyVideoProps>(
  function LazyVideo(
    {
      src,
      rootMargin = "150px",
      className,
      autoPlay = true,
      loop = true,
      muted = true,
      playsInline = true,
      ...props
    },
    forwardedRef,
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loaded, setLoaded] = useState(false);

    useImperativeHandle(forwardedRef, () => videoRef.current!);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const playIfVisible = () => {
        const rect = video.getBoundingClientRect();
        const inView = rect.top < window.innerHeight + 150 && rect.bottom > -150;
        if (inView && loaded) video.play().catch(() => {});
      };

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!loaded) setLoaded(true);
            else video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { rootMargin, threshold: 0.01 },
      );

      observer.observe(video);

      const onVisibility = () => {
        if (document.hidden) video.pause();
        else playIfVisible();
      };
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
      };
    }, [loaded, rootMargin]);

    return (
      <video
        ref={videoRef}
        src={loaded ? src : undefined}
        preload="none"
        autoPlay={autoPlay && loaded}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        className={className}
        {...props}
      />
    );
  },
);
