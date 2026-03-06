"use client";

import Image from 'next/image';
import { Users, Lightbulb, Target, BookOpen, Cpu, TrendingUp, ShieldCheck } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const About = () => {
  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-[80vh] relative flex items-center justify-center overflow-hidden bg-black">
        {/* Single Static Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/about_slider/slide1.png"
            alt="About Saarway"
            fill
            className="object-cover"
            priority
            quality={90}
          />
        </div>

        {/* Lighter Gradient Overlay for clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 z-0" />

        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center bg-black/30 backdrop-blur-sm border border-white/10 p-10 md:p-16 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] sw-fade-in-up">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <Image
                  src="/images/logo-icon-v2.png"
                  alt="Saarway"
                  width={56}
                  height={56}
                  className="drop-shadow-md brightness-0 invert"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-6 drop-shadow-md tracking-tight">
              About Saarway
            </h1>

            <p className="text-lg md:text-xl text-white max-w-2xl mx-auto font-bold leading-relaxed drop-shadow-md mb-10">
              Digitising Pakistan's livestock industry. Discover how a university project evolved into a nationwide unified platform for farm management and cattle trading.
            </p>

            <button onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })} className="px-8 py-4 rounded-xl font-extrabold bg-[#16a34a] text-white hover:bg-[#15803d] shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] transition-all duration-300 transform hover:-translate-y-0.5 sw-ripple">
              Read Our Story
            </button>
          </div>
        </div>
      </section>

      {/* The Story */}
      <section className="py-24 bg-sw-green-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            {/* Added hovering gradient to The Story to reflect "Our Story" glassmorphic requirement */}
            <div className="sw-glass-hover-gradient p-10 md:p-14 rounded-3xl space-y-6 text-sw-green-950/80 text-xl leading-[1.8] font-medium text-center">
              <p>
                Pakistan&apos;s livestock sector is a powerhouse — contributing significantly to the nation&apos;s GDP and sustaining millions of rural livelihoods. Yet the farmers at its heart still rely on handwritten ledgers, word-of-mouth deals, and a patchwork of phone calls to manage their operations.
              </p>
              <p>
                Saarway was born out of this exact gap. It started as a Web Development semester project at university, supervised by <strong className="text-sw-green-700 font-bold">Rana Muhammad Ajmal</strong>. What began as a classroom exercise quickly revealed itself to be something far more meaningful.
              </p>
              <p>
                Founded by <strong className="text-sw-green-700 font-bold">Muhammad Talal Khan</strong>, Saarway set out to answer one powerful question: <em>what if a farmer in Kasur could list his cattle online and a buyer hundreds of kilometres away in Lahore could discover him in seconds?</em>
              </p>
              <p>
                The result is Pakistan&apos;s first multi-farm livestock ERP and marketplace — a platform where every registered farm receives a complete digital management system, and every buyer gains instant access to verified livestock listings from across the country.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight">The Problem</h2>
            <p className="text-center text-sw-green-950/60 mb-6 max-w-lg mx-auto font-medium text-lg">Why Pakistan&apos;s livestock industry needs a digital revolution</p>
            <div className="w-20 h-1.5 bg-destructive rounded-full mx-auto mb-16" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Manual Records', desc: 'Farmers still rely on handwritten registers and memory to track hundreds of animals' },
              { icon: Target, title: 'No Herd Management', desc: 'No platform exists to track individual animals, health records, and lineage digitally' },
              { icon: Users, title: 'Missing Marketplace', desc: 'Buyers and sellers connect through word of mouth — limiting reach and transparency' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 150}>
                {/* Implemented interactive gradient card */}
                <div className="sw-glass-hover-gradient text-center rounded-3xl p-8 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6 relative z-10 border border-destructive/20 shadow-sm">
                    <item.icon className="w-8 h-8 text-destructive" />
                  </div>
                  <h3 className="font-bold text-sw-green-950 mb-3 text-xl">{item.title}</h3>
                  <p className="text-base text-sw-green-950/70 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-24 bg-sw-green-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight">The Solution</h2>
            <p className="text-center text-sw-green-950/60 mb-6 max-w-lg mx-auto font-medium text-lg">One platform for every farm, every buyer</p>
            <div className="w-20 h-1.5 bg-sw-green-500 rounded-full mx-auto mb-16" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Cpu, title: 'Full Farm ERP', desc: 'Cattle management, health tracking, financials, buying, selling — all in one system' },
              { icon: TrendingUp, title: 'Public Marketplace', desc: 'List cattle online and let verified buyers discover you from across Pakistan' },
              { icon: ShieldCheck, title: 'Multi-Tenant SaaS', desc: 'Each farm gets its own isolated workspace with role-based access for the entire team' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 150}>
                {/* Implemented interactive gradient card */}
                <div className="sw-glass-hover-gradient rounded-3xl p-8 h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-sw-green-50 flex items-center justify-center mx-auto mb-6 relative z-10 border border-sw-green-100 shadow-sm">
                    <item.icon className="w-8 h-8 text-sw-green-600 sw-icon-premium" />
                  </div>
                  <h3 className="font-bold text-sw-green-950 mb-3 text-xl">{item.title}</h3>
                  <p className="text-base text-sw-green-950/70 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={500}>
            <p className="text-center text-2xl font-extrabold text-sw-green-700 mt-16 italic">&ldquo;One platform. Every farm. Every buyer.&rdquo;</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission */}
      {/* Implemented dark glassmorphism darker than footer as requested overall for dark sections */}
      <section className="py-32 relative overflow-hidden bg-sw-green-950 text-white" style={{ background: 'linear-gradient(135deg, hsl(120 75% 15%), hsl(120 80% 8%))' }}>
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 1440 300" fill="none">
            <pattern id="missionHex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="1440" height="300" fill="url(#missionHex)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <AnimatedSection>
            <blockquote className="text-center sw-glass-dark p-12 md:p-16 rounded-3xl">
              <Lightbulb className="w-16 h-16 text-sw-gold-400 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <p className="text-3xl md:text-4xl font-bold text-white italic leading-relaxed">
                &ldquo;To digitise Pakistan&apos;s livestock industry — giving every farm a digital home and every buyer instant access to verified livestock.&rdquo;
              </p>
            </blockquote>
          </AnimatedSection>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight">Team & Supervision</h2>
            <p className="text-center text-sw-green-950/70 mb-6 font-medium text-lg">The people behind Saarway</p>
            <div className="w-20 h-1.5 bg-sw-green-500 rounded-full mx-auto mb-16" />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Muhammad Talal Khan', role: 'Founder & CEO', desc: 'Visionary behind Saarway, turning a semester idea into Pakistan\'s first livestock ERP' },
              { name: 'Rana Muhammad Ajmal', role: 'Project Supervisor', desc: 'Guiding the Web Development semester project that gave birth to Saarway' },
            ].map((person, i) => (
              <AnimatedSection key={person.name} delay={i * 150}>
                {/* Apply interactive gradient hover to Team section */}
                <div className="sw-glass-hover-gradient rounded-3xl p-10 text-center h-full">
                  <div className="w-24 h-24 rounded-2xl bg-sw-green-100/50 flex items-center justify-center mx-auto mb-6 border border-sw-green-200 relative z-10">
                    <Users className="w-12 h-12 text-sw-green-700" />
                  </div>
                  <h3 className="font-extrabold text-sw-green-950 text-2xl mb-2">{person.name}</h3>
                  <p className="text-base text-sw-green-700 font-extrabold mb-4 uppercase tracking-wider">{person.role}</p>
                  <p className="text-base text-sw-green-950/70 leading-relaxed font-semibold">{person.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={300}>
            <div className="text-center mt-12">
              <span className="inline-block py-3.5 px-8 rounded-xl bg-sw-green-50 border border-sw-green-200 text-sm md:text-base text-sw-green-800 font-bold shadow-sm">
                Web Development Semester Project
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
};

export default About;
