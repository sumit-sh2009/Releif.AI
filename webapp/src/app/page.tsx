"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { LazyMount } from "@/components/ui/LazyMount";

const Intro = dynamic(() => import("@/components/landing/Intro"));
const CoreSystems = dynamic(() => import("@/components/landing/CoreSystems"));
const Features = dynamic(() => import("@/components/landing/Features"));
const BigStatement = dynamic(() => import("@/components/landing/BigStatement"));
const FinalCta = dynamic(() => import("@/components/landing/FinalCta"));
const Footer = dynamic(() => import("@/components/landing/Footer"));

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar />
      <Hero />
      <LazyMount minHeight="400px">
        <Intro />
      </LazyMount>
      <LazyMount minHeight="100vh">
        <CoreSystems />
      </LazyMount>
      <LazyMount minHeight="100vh">
        <Features />
      </LazyMount>
      <LazyMount minHeight="300px">
        <BigStatement />
      </LazyMount>
      <LazyMount minHeight="500px">
        <FinalCta />
      </LazyMount>
      <LazyMount minHeight="200px">
        <Footer />
      </LazyMount>
    </div>
  );
}
