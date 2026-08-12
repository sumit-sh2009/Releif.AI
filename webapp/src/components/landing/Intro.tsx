"use client";
import { useRef } from 'react';
import { useInView } from 'motion/react';
import { TextReveal } from './ui/text-reveal';

export default function Intro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-32 px-6 border-t border-white/5" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        <TextReveal
          as="div"
          className="text-neutral-500 text-xs font-semibold tracking-[0.2em] uppercase mb-12"
          per="word"
          preset="fade-in-blur"
          speedReveal={1.2}
          trigger={isInView}
        >
          THE RESPONSE GAP
        </TextReveal>
        
        <TextReveal
          as="h2"
          className="type-display text-4xl md:text-5xl lg:text-6xl mb-8 leading-[1.2]"
          per="word"
          preset="fade-in-blur"
          speedReveal={1.2}
          delay={0}
          trigger={isInView}
        >
          Help shouldn&apos;t arrive after the crisis.
        </TextReveal>
        
        <TextReveal
          as="p"
          className="text-neutral-400 text-lg md:text-2xl leading-relaxed max-w-3xl mx-auto"
          per="word"
          preset="fade-in-blur"
          speedReveal={1.5}
          delay={0.1}
          trigger={isInView}
        >
          Disaster response depends on knowing what is happening, knowing who needs help, and getting the right people there quickly. ReliefAI brings those pieces together in one response network.
        </TextReveal>
      </div>
    </section>
  );
}

