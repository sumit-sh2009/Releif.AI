"use client";

import { motion } from "motion/react";
import { Rocket } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-[var(--spacing-container-padding-desktop)] py-24 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest/80 backdrop-blur-xl rounded-full shadow-sm border border-outline-variant/20"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(183,19,26,0.8)]"></span>
          <span className="font-data-mono text-[13px] text-primary font-bold uppercase tracking-[0.2em]">
            Active Intelligence Engine
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[64px] md:text-[96px] leading-[1.05] tracking-[-0.04em] text-on-background font-bold"
        >
          Predict.
          <span className="text-primary block md:inline"> Respond. </span>
          Recover.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[20px] md:text-[24px] leading-relaxed text-on-surface-variant max-w-2xl font-light tracking-[-0.01em]"
        >
          A unified operational loop where hyper-local predictive models feed directly into real-time emergency response, saving crucial minutes when they matter most.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full"
        >
          <a
            href="/get-help"
            className="inline-flex items-center justify-center px-8 py-4 bg-error text-on-error text-[16px] font-semibold rounded-full shadow-[0_0_20px_rgba(186,26,26,0.4)] hover:shadow-[0_0_30px_rgba(186,26,26,0.6)] hover:bg-red-700 transition-all duration-300 w-full sm:w-auto"
          >
            Get Help Now
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 bg-surface-container-lowest/50 backdrop-blur-md text-on-surface text-[16px] font-semibold rounded-full border border-outline-variant/30 hover:bg-surface-container-lowest/80 transition-all duration-300 w-full sm:w-auto"
          >
            Operations Dashboard
          </a>
        </motion.div>
      </div>
    </section>
  );
}
