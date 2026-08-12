"use client";

import { motion } from "motion/react";
import { Activity, Zap, Rocket, HeartPulse } from "lucide-react";

export function BentoGrid() {
  return (
    <section className="py-[80px] px-[var(--spacing-container-padding-desktop)] relative z-10 bg-surface-container-lowest/90 backdrop-blur-2xl border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row gap-12 justify-between items-start mb-16"
        >
          <div className="md:w-1/2">
            <h2 className="text-[32px] font-bold text-on-surface mb-6 tracking-tight">The Unified Loop</h2>
            <p className="text-[18px] text-on-surface-variant leading-relaxed">
              Siloed data costs lives. ReliefAI merges disparate data streams—weather patterns, social sentiment, sensor telemetry—into a single, actionable timeline.
            </p>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Card 1: Prediction */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="col-span-1 md:col-span-2 row-span-1 relative bg-surface rounded-[24px] p-8 overflow-hidden group shadow-sm border border-outline-variant/10 hover:shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-highest mb-6">
                  <Activity className="text-tertiary w-6 h-6" />
                </div>
                <h3 className="text-[24px] font-semibold text-on-surface mb-2">Predictive Synthesis</h3>
                <p className="text-[14px] text-on-surface-variant max-w-md">
                  Ingests petabytes of historical and real-time data to forecast event vectors with up to 94% accuracy before they manifest.
                </p>
              </div>
              <div className="self-end -mr-8 -mb-8 opacity-80 group-hover:scale-105 transition-transform duration-700">
                <svg className="text-tertiary/20" fill="currentColor" height="100" viewBox="0 0 200 100" width="200">
                  <circle cx="150" cy="50" r="40"></circle>
                  <circle cx="100" cy="50" r="30"></circle>
                  <circle cx="60" cy="50" r="20"></circle>
                  <circle cx="30" cy="50" r="10"></circle>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Card 2: AI Core */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="col-span-1 row-span-2 relative bg-primary rounded-[24px] p-8 overflow-hidden group text-on-primary shadow-lg shadow-primary/20 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10 w-full h-full flex flex-col">
              <div className="font-data-mono text-[13px] opacity-80 mb-8 uppercase tracking-widest">[ ENGINE_ACTIVE ]</div>
              <h3 className="text-[40px] leading-[1.1] font-bold mb-6 tracking-tight">Zero <br/>Latency <br/>Decision <br/>Making.</h3>
              <div className="mt-auto space-y-4">
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="text-[14px] opacity-90">Processing Time</span>
                  <span className="font-data-mono font-bold">&lt;12ms</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/20 pb-2">
                  <span className="text-[14px] opacity-90">Data Streams</span>
                  <span className="font-data-mono font-bold">14,000+</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Response */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="col-span-1 row-span-1 relative bg-surface-container rounded-[24px] p-8 overflow-hidden group shadow-sm border border-outline-variant/10 hover:shadow-md transition-all duration-300"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-highest mb-4">
                <Zap className="text-outline w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[24px] font-semibold text-on-surface mb-2">Automated Dispatch</h3>
                <p className="text-[14px] text-on-surface-variant">
                  Pre-allocates resources and generates optimal deployment routes based on real-time traffic and hazard mapping.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Recovery */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="col-span-1 row-span-1 relative bg-surface rounded-[24px] p-8 overflow-hidden shadow-sm border border-outline-variant/10 hover:shadow-md transition-all duration-300"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-highest mb-4">
                <HeartPulse className="text-primary w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[24px] font-semibold text-on-surface mb-2">Resilient Recovery</h3>
                <p className="text-[14px] text-on-surface-variant">
                  Continuous post-event monitoring ensures resource allocation adapts to secondary cascading failures.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
