"use client";
import { useRef } from 'react';
import { useInView } from 'motion/react';
import { TextRoll } from './ui/text-roll';

export default function BigStatement() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section ref={containerRef} className="py-40 px-6 border-t border-white/5 flex items-center justify-center overflow-hidden">
      <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="type-overline text-neutral-500 mb-12">
          <TextRoll trigger={isInView} delay={0} duration={0.5} getEnterDelay={(i) => i * 0.04} getExitDelay={(i) => i * 0.04 + 0.2}>
            THE GOAL
          </TextRoll>
        </div>
        
        <h2 className="type-display text-5xl md:text-7xl lg:text-8xl mb-12 leading-[1.05] relative z-10">
          <TextRoll trigger={isInView} delay={0.4} duration={0.6} getEnterDelay={(i) => i * 0.04} getExitDelay={(i) => i * 0.04 + 0.2}>
            Make the distance between crisis and help smaller.
          </TextRoll>
        </h2>
        
        <p className="text-neutral-400 text-xl md:text-2xl leading-relaxed max-w-3xl">
          <TextRoll trigger={isInView} delay={1.0} duration={0.5} getEnterDelay={(i) => i * 0.015} getExitDelay={(i) => i * 0.015 + 0.2}>
            ReliefAI brings prediction, emergency response, and volunteers into one connected system.
          </TextRoll>
        </p>
      </div>
    </section>
  );
}

