"use client";
import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { TiltCard } from './ui/be-ui-tilt-card';

const AnimatedHorizontalArrow = ({ draw, opacity }: { draw: MotionValue<number>, opacity: MotionValue<number> }) => (
  <motion.svg style={{ opacity }} className="w-12 h-6 lg:w-20 lg:h-8 text-neutral-600 hidden xl:block shrink-0" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path d="M0 12H98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: draw }} />
    <motion.path d="M88 2L98 12L88 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
  </motion.svg>
);

const AnimatedVerticalArrow = ({ draw, opacity }: { draw: MotionValue<number>, opacity: MotionValue<number> }) => (
  <motion.svg style={{ opacity }} className="w-6 h-12 text-neutral-600 block xl:hidden my-2 shrink-0" viewBox="0 0 24 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path d="M12 0V98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: draw }} />
    <motion.path d="M2 88L12 98L22 88" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
  </motion.svg>
);

export default function CoreSystems() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Mapping scroll progress to animations (with intentional dead-zones for "cooldowns")
  const titleOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.05], [20, 0]);

  // Card 1: Predict
  const opacity1 = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const y1 = useTransform(scrollYProgress, [0.05, 0.15], [40, 0]);

  // Arrow 1 (Draws in after Cooldown 1)
  const arrow1Draw = useTransform(scrollYProgress, [0.25, 0.35], [0, 1]);
  const arrow1Opacity = useTransform(scrollYProgress, [0.25, 0.30, 0.45, 0.50], [0, 1, 1, 0]);

  // Card 2: Respond
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
  const y2 = useTransform(scrollYProgress, [0.35, 0.45], [40, 0]);

  // Arrow 2 (Draws in after Cooldown 2)
  const arrow2Draw = useTransform(scrollYProgress, [0.55, 0.65], [0, 1]);
  const arrow2Opacity = useTransform(scrollYProgress, [0.55, 0.60, 0.75, 0.80], [0, 1, 1, 0]);

  // Card 3: Connect
  const opacity3 = useTransform(scrollYProgress, [0.65, 0.75], [0, 1]);
  const y3 = useTransform(scrollYProgress, [0.65, 0.75], [40, 0]);

  return (
    <section ref={containerRef} className="h-[400vh] relative border-t border-white/5 cv-auto">
      <div className="sticky top-0 h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden max-w-[1600px] mx-auto w-full">
        
        <motion.div 
          style={{ opacity: titleOpacity, y: titleY }}
          className="type-overline text-neutral-500 mb-10 lg:mb-16 text-center"
        >
          ONE PLATFORM. THREE ACTIONS.
        </motion.div>
        
        <div className="flex flex-col xl:flex-row items-center justify-center gap-4 lg:gap-8 w-full">
          
          {/* 01 Predict */}
          <motion.div style={{ opacity: opacity1, y: y1 }} className="w-full max-w-sm flex-1">
            <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -40]) }}>
              <TiltCard className="relative p-8 lg:p-10 border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-500 rounded-[2rem] min-h-[200px] lg:min-h-[320px] flex flex-col cursor-crosshair overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-[2rem]" />
                <div className="relative z-10">
                  <div className="text-neutral-600 type-mono mb-4 lg:mb-8">01</div>
                  <h3 className="type-display text-2xl lg:text-3xl mb-2 lg:mb-4 uppercase">Predict</h3>
                  <p className="text-neutral-400 text-base lg:text-lg leading-relaxed">
                    Identify where disaster risk is rising and where resources may be needed next.
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>

          {/* Arrow 1 */}
          <AnimatedHorizontalArrow draw={arrow1Draw} opacity={arrow1Opacity} />
          <AnimatedVerticalArrow draw={arrow1Draw} opacity={arrow1Opacity} />

          {/* 02 Respond */}
          <motion.div style={{ opacity: opacity2, y: y2 }} className="w-full max-w-sm flex-1">
            <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -80]) }}>
              <TiltCard className="relative p-8 lg:p-10 border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-500 rounded-[2rem] min-h-[200px] lg:min-h-[320px] flex flex-col cursor-crosshair overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-[2rem]" />
                <div className="relative z-10">
                  <div className="text-neutral-600 type-mono mb-4 lg:mb-8">02</div>
                  <h3 className="type-display text-2xl lg:text-3xl mb-2 lg:mb-4 uppercase">Respond</h3>
                  <p className="text-neutral-400 text-base lg:text-lg leading-relaxed">
                    Give people a direct way to request emergency assistance and enter the response network.
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>

          {/* Arrow 2 */}
          <AnimatedHorizontalArrow draw={arrow2Draw} opacity={arrow2Opacity} />
          <AnimatedVerticalArrow draw={arrow2Draw} opacity={arrow2Opacity} />

          {/* 03 Connect */}
          <motion.div style={{ opacity: opacity3, y: y3 }} className="w-full max-w-sm flex-1">
            <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -120]) }}>
              <TiltCard className="relative p-8 lg:p-10 border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/[0.15] transition-all duration-500 rounded-[2rem] min-h-[200px] lg:min-h-[320px] flex flex-col cursor-crosshair overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none rounded-[2rem]" />
                <div className="relative z-10">
                  <div className="text-neutral-600 type-mono mb-4 lg:mb-8">03</div>
                  <h3 className="type-display text-2xl lg:text-3xl mb-2 lg:mb-4 uppercase">Connect</h3>
                  <p className="text-neutral-400 text-base lg:text-lg leading-relaxed">
                    Bring volunteers and people in need together where help can make the biggest difference.
                  </p>
                </div>
              </TiltCard>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}

