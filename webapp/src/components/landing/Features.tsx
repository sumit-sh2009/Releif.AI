"use client";
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import WhisperText from './ui/whisper-text';

export default function Features() {
  return (
    <div className="flex flex-col">
      {/* 05 PREDICTION */}
      <section id="predict" className="sticky top-0 h-[100dvh] flex items-center justify-center px-6 border-t border-white/5 bg-black z-10 overflow-hidden cv-auto">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center pt-20 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-2 lg:order-1 h-[300px] lg:h-[600px] border border-white/10 bg-neutral-950 flex flex-col items-center justify-center relative w-full overflow-hidden"
          >
             <Image src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1000" alt="Map Prediction" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-60 mix-blend-luminosity" loading="lazy" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
             <div className="absolute bottom-4 left-4 type-overline text-neutral-400 bg-black/80 px-3 py-1.5 rounded backdrop-blur-md border border-white/10">PREDICTIVE MAP VIEW</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 flex flex-col"
          >
            <div className="type-overline text-neutral-500 mb-6 lg:mb-8">
              01 / PREDICTION
            </div>
            <WhisperText
              text="Know where help will be needed."
              className="type-display text-4xl lg:text-5xl mb-4 lg:mb-6 leading-[1.1]"
              delay={80}
              duration={0.4}
              y={20}
            />
            <p className="text-neutral-400 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12">
              ReliefAI uses available disaster and demand signals to identify areas facing elevated risk, helping response teams prepare before needs become emergencies.
            </p>
            
            <div className="flex flex-col gap-4 lg:gap-6 mb-8 lg:mb-12 border-l border-white/10 pl-6">
              <div>
                <div className="type-overline text-neutral-500 mb-1">FLOOD RISK</div>
                <div className="text-red-500 type-body-sm font-medium">HIGH</div>
              </div>
              <div>
                <div className="type-overline text-neutral-500 mb-1">REGION</div>
                <div className="text-white type-body-sm font-medium">ASSAM, INDIA</div>
              </div>
              <div>
                <div className="type-overline text-neutral-500 mb-1">STATUS</div>
                <div className="text-white type-body-sm font-medium">MONITORING</div>
              </div>
            </div>
            
            <div>
              <button className="text-white text-sm font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity">
                Explore prediction <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 06 EMERGENCY */}
      <section id="emergency" className="sticky top-0 h-[100dvh] flex items-center justify-center px-6 border-t border-white/5 bg-black z-20 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] cv-auto">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center pt-20 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="order-2 lg:order-1 h-[300px] lg:h-[600px] border border-white/10 bg-neutral-950 flex flex-col items-center justify-center w-full relative overflow-hidden"
          >
             <Image src="https://images.unsplash.com/photo-1520694478166-daaaaec95b69?auto=format&fit=crop&q=80&w=1000" alt="Emergency Response" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-60 mix-blend-luminosity" loading="lazy" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
             <div className="absolute bottom-4 left-4 type-overline text-neutral-400 bg-black/80 px-3 py-1.5 rounded backdrop-blur-md border border-white/10">EMERGENCY REQUEST SYSTEM</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 lg:order-2 flex flex-col"
          >
            <div className="type-overline text-neutral-500 mb-6 lg:mb-8">
              02 / EMERGENCY
            </div>
            <WhisperText
              text="One request. One clear path to help."
              className="type-display text-4xl lg:text-5xl mb-4 lg:mb-6 leading-[1.1]"
              delay={80}
              duration={0.4}
              y={20}
            />
            <p className="text-neutral-400 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12">
              Submit what you need, verify your phone number, and receive a unique request ID that lets you track your request through the response process.
            </p>
            
            <div className="flex items-center gap-2 lg:gap-4 type-overline text-neutral-500 mb-8 lg:mb-12 overflow-x-auto whitespace-nowrap">
              <span className="text-white">REQUEST</span>
              <ArrowRight className="w-3 h-3" />
              <span>VERIFY</span>
              <ArrowRight className="w-3 h-3" />
              <span>ASSIGN</span>
              <ArrowRight className="w-3 h-3" />
              <span>RESPOND</span>
            </div>
            
            <div className="mb-6 lg:mb-8">
              <button className="bg-white text-black px-6 py-3 text-sm font-semibold flex items-center gap-2 hover:bg-neutral-200 transition-colors">
                Request Help <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-neutral-500 text-xs tracking-wide">
              OTP verification · Unique request ID · Request tracking
            </div>
          </motion.div>
        </div>
      </section>

      {/* 07 VOLUNTEER */}
      <section id="volunteer" className="sticky top-0 h-[100dvh] flex items-center justify-center px-6 border-t border-white/5 bg-black z-30 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)] cv-auto">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 items-center pt-20 lg:pt-0">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col"
          >
            <div className="type-overline text-neutral-500 mb-6 lg:mb-8">
              03 / VOLUNTEER
            </div>
            <WhisperText
              text="Turn willingness into action."
              className="type-display text-4xl lg:text-5xl mb-4 lg:mb-6 leading-[1.1]"
              delay={80}
              duration={0.4}
              y={20}
            />
            <p className="text-neutral-400 text-base lg:text-lg leading-relaxed mb-8 lg:mb-12">
              Volunteers can discover active requests, choose where they can help, and become part of the response when people need it most.
            </p>
            
            <div className="mb-10 lg:mb-16">
              <button className="text-white text-sm font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity">
                Become a Volunteer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 lg:gap-6 pt-6 lg:pt-8 border-t border-white/10">
              <div>
                <div className="type-overline text-neutral-500 mb-1">ACTIVE REQUESTS</div>
                <div className="text-white type-heading-l font-medium">24</div>
              </div>
              <div>
                <div className="type-overline text-neutral-500 mb-1">HIGH PRIORITY</div>
                <div className="text-white type-heading-l font-medium">08</div>
              </div>
              <div>
                <div className="type-overline text-neutral-500 mb-1">VOLUNTEERS ACTIVE</div>
                <div className="text-white type-heading-l font-medium">31</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-[300px] lg:h-[600px] border border-white/10 bg-neutral-950 flex flex-col items-center justify-center w-full relative overflow-hidden"
          >
             <Image src="https://images.unsplash.com/photo-1593113565694-c676718d0939?auto=format&fit=crop&q=80&w=1000" alt="Volunteers in action" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-60 mix-blend-luminosity" loading="lazy" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
             <div className="absolute bottom-4 left-4 type-overline text-neutral-400 bg-black/80 px-3 py-1.5 rounded backdrop-blur-md border border-white/10">VOLUNTEER DISPATCH</div>
          </motion.div>
        </div>
      </section>

      {/* 08 TRACKING */}
      <section className="py-32 px-6 border-t border-white/5 bg-neutral-950/50 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto text-center"
        >
          <div className="type-overline text-neutral-500 mb-8">
            EVERY REQUEST HAS A STATUS.
          </div>
          <h2 className="type-display text-4xl lg:text-5xl mb-6 leading-[1.1]">
            Know what happens next.
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto mb-20">
            Every request receives a unique ID and moves through a clear response lifecycle, so people can see where their request stands.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 max-w-3xl mx-auto mb-20 relative">
             <div className="hidden md:block absolute top-1/2 left-[5%] right-[5%] h-[1px] bg-white/10 -translate-y-1/2 z-0"></div>
             
             {['CREATED', 'VERIFIED', 'MATCHED', 'IN PROGRESS', 'COMPLETED'].map((step, i) => (
               <div key={step} className="flex flex-col items-center gap-4 relative z-10 bg-black px-2">
                 <div className="w-3 h-3 rounded-full bg-black border-2 border-white"></div>
                 <div className={`type-overline ${i === 0 ? 'text-white' : 'text-neutral-500'}`}>{step}</div>
               </div>
             ))}
          </div>
          
          <div className="inline-flex flex-col items-center border border-white/10 px-10 py-8 bg-black">
            <div className="type-overline text-neutral-500 mb-2">REQUEST ID</div>
            <div className="text-white type-mono text-2xl md:text-3xl font-medium">AF-7K2M9X4P</div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

