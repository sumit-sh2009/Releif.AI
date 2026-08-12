"use client";

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { LazyVideo } from '@/components/ui/LazyVideo';

const TypewriterText = ({ text, className }: { text: string; className?: string }) => {
  const words = text.split(' ');
  return (
    <span className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block opacity-0 animate-[wordReveal_0.5s_ease_forwards]"
          style={{ animationDelay: `${0.3 + i * 0.12}s` }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
};

export default function FinalCta() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    <section ref={containerRef} className="py-40 px-6 border-t border-white/5 relative overflow-hidden">
      
      {/* Video Background with Parallax — single video, lazy-loaded & paused off-screen */}
      <motion.div 
        style={{ y, opacity }} 
        className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center z-0"
      >
        <LazyVideo
          src="/assets/videos/ascii-magic-2.mp4"
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-black" />
      </motion.div>

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-neutral-500 text-xs font-semibold tracking-[0.2em] uppercase mb-8 font-sans"
        >
          READY WHEN IT MATTERS
        </motion.div>
        
        <h2 className="type-display text-5xl md:text-7xl mb-8 leading-[1.1] min-h-[140px] md:min-h-[160px]">
          <TypewriterText text="Help starts with knowing where to look." />
        </h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          viewport={{ once: true }}
          className="text-neutral-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-12"
        >
          Whether you need help or you&apos;re ready to give it, ReliefAI gives you a way to act.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Link 
            href="/get-help" 
            className="citizen-btn-primary text-xl px-10 py-5 shadow-[0_8px_32px_rgba(220,38,38,0.25)] landing-cta"
          >
            Get Help
            <Zap className="w-6 h-6" />
          </Link>
          <Link 
            href="/volunteers" 
            className="type-body-sm text-neutral-400 font-medium hover:text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-premium)] flex items-center gap-1 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] rounded-md"
          >
            Become a volunteer <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
