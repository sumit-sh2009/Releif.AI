"use client";
import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, Zap } from 'lucide-react';
import Link from 'next/link';
import { LazyVideo } from '@/components/ui/LazyVideo';

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const setRate = () => {
      video.playbackRate = 0.7;
    };
    video.addEventListener("loadedmetadata", setRate);
    setRate();
    return () => video.removeEventListener("loadedmetadata", setRate);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.15, 0.8], [1, 1, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={containerRef} className="min-h-screen relative px-6 md:px-12 pt-24 pb-8 flex flex-col justify-center max-w-[1600px] mx-auto w-full z-10 overflow-hidden">
      
      {/* Content wrapper: Left-aligned to leave room on the right */}
      <motion.div 
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ y: contentY, opacity: contentOpacity }} 
        className="flex flex-col lg:w-[65%] z-20 relative mt-4 md:mt-8"
      >
        
        {/* Headline */}
        <div className="flex flex-col">
          <h1 className="type-display-xl text-white">
            When disaster strikes,
          </h1>
          <h1 className="type-display-xl text-white/90 md:ml-[8%] mt-3 md:mt-4 font-semibold">
            every second matters.
          </h1>
        </div>

        <div className="mt-12 md:mt-16 flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          <div className="max-w-md flex flex-col w-full prose-width-narrow">
            <p className="type-body-lg text-white/95">
              ReliefAI connects people in crisis with the information, resources,{' '}
              <span className="text-[var(--text-secondary)]">and human help they need, when it matters most.</span>
            </p>
            <div className="w-full h-px bg-white/10 my-8" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center w-full gap-6">
              <Link
                href="/get-help"
                className="citizen-btn-primary text-base px-10 py-4 shadow-[0_8px_32px_rgba(220,38,38,0.25)] landing-cta"
              >
                Get Help
                <Zap className="w-5 h-5" />
              </Link>

              <a href="#predict" className="flex items-center gap-3 text-[var(--text-muted)] hover:text-white transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors bg-white/5 shrink-0">
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span className="type-overline w-24 leading-snug">Explore features</span>
              </a>
            </div>
          </div>

          {/* Core Systems Navigation (Artisanal list) */}
          <div className="flex flex-col gap-6 md:pt-2 w-full md:w-[280px]">
            <span className="type-overline text-neutral-500">Core Systems</span>
            <div className="w-8 h-px bg-white/20"></div>
            <div className="text-neutral-400 text-sm flex flex-col gap-4 font-medium">
              <a href="#predict" className="hover:text-white transition-colors flex items-center justify-between gap-8 group">
                <span className="group-hover:translate-x-2 transition-transform duration-300">Prediction</span> 
                <span className="text-neutral-600 font-mono text-xs">01</span>
              </a>
              <div className="w-full h-px bg-white/5"></div>
              <a href="#emergency" className="hover:text-white transition-colors flex items-center justify-between gap-8 group">
                <span className="group-hover:translate-x-2 transition-transform duration-300 text-red-500/70 group-hover:text-red-400">Emergency</span> 
                <span className="text-neutral-600 font-mono text-xs">02</span>
              </a>
              <div className="w-full h-px bg-white/5"></div>
              <a href="#volunteer" className="hover:text-white transition-colors flex items-center justify-between gap-8 group">
                <span className="group-hover:translate-x-2 transition-transform duration-300">Volunteer</span> 
                <span className="text-neutral-600 font-mono text-xs">03</span>
              </a>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Right-hand Animated ASCII Blue Earth */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        style={{ scale: bgScale, opacity: contentOpacity }} 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[900px] lg:h-[900px] rounded-full pointer-events-none flex items-center justify-center hidden md:flex z-0 mix-blend-screen translate-x-[20%]"
      >
        <LazyVideo
          ref={videoRef}
          src="/assets/videos/ascii-magic-3.mp4"
          className="w-full h-full object-cover rounded-full opacity-60"
        />
      </motion.div>
    </section>
  );
}

