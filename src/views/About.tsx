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
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(120 50% 48%) 0%, hsl(120 67% 37%) 50%, hsl(120 75% 21%) 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 1440 400" fill="none">
            <pattern id="aboutHex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="1440" height="400" fill="url(#aboutHex)" />
          </svg>
        </div>
        <div className="absolute top-1/3 left-[5%] w-48 h-48 rounded-full bg-white/[0.04] blur-3xl animate-[swFloat_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-[10%] w-36 h-36 rounded-full bg-white/[0.06] blur-3xl animate-[swFloat_10s_ease-in-out_infinite_2s]" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="sw-fade-in mb-6">
            <Image
              src="/images/logo-icon.png"
              alt="Saarway"
              width={70}
              height={70}
              className="mx-auto brightness-0 invert drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sw-fade-in-up" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
            Our Story
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto sw-fade-in-up" style={{ animationDelay: '200ms' }}>
            How a university project became Pakistan&apos;s first livestock management platform
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* The Story */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection>
            <div className="space-y-5 text-foreground text-lg leading-relaxed">
              <p>
                Pakistan&apos;s livestock sector is a powerhouse — contributing significantly to the nation&apos;s GDP and sustaining millions of rural livelihoods. Yet the farmers at its heart still rely on handwritten ledgers, word-of-mouth deals, and a patchwork of phone calls to manage their operations.
              </p>
              <p>
                Saarway was born out of this exact gap. It started as a Web Development semester project at university, supervised by <strong className="text-sw-green-700">Rana Muhammad Ajmal</strong>. What began as a classroom exercise quickly revealed itself to be something far more meaningful.
              </p>
              <p>
                Founded by <strong className="text-sw-green-700">Muhammad Talal Khan</strong>, Saarway set out to answer one powerful question: <em>what if a farmer in Kasur could list his cattle online and a buyer hundreds of kilometres away in Lahore could discover him in seconds?</em>
              </p>
              <p>
                The result is Pakistan&apos;s first multi-farm livestock ERP and marketplace — a platform where every registered farm receives a complete digital management system, and every buyer gains instant access to verified livestock listings from across the country. From a semester project to a platform with real ambition — this is only the beginning.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-sw-green-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">The Problem</h2>
            <p className="text-center text-muted-foreground mb-4 max-w-lg mx-auto">Why Pakistan&apos;s livestock industry needs a digital revolution</p>
            <div className="w-16 h-1 bg-gradient-to-r from-destructive/60 to-destructive rounded-full mx-auto mb-14" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Manual Records', desc: 'Farmers still rely on handwritten registers and memory to track hundreds of animals' },
              { icon: Target, title: 'No Digital Herd Management', desc: 'No platform exists to track individual animals, health records, and lineage digitally' },
              { icon: Users, title: 'No Online Marketplace', desc: 'Buyers and sellers connect through word of mouth — limiting reach and transparency' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 150}>
                <div className="bg-card rounded-2xl p-6 border border-border text-center hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(232,88,88,0.1)] hover:border-destructive/30 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">The Solution</h2>
            <p className="text-center text-muted-foreground mb-4 max-w-lg mx-auto">One platform for every farm, every buyer</p>
            <div className="w-16 h-1 bg-gradient-to-r from-sw-green-300 to-primary rounded-full mx-auto mb-14" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: 'Full Farm ERP', desc: 'Cattle management, health tracking, financials, buying, selling — all in one system' },
              { icon: TrendingUp, title: 'Public Marketplace', desc: 'List cattle online and let verified buyers discover you from across Pakistan' },
              { icon: ShieldCheck, title: 'Multi-Tenant SaaS', desc: 'Each farm gets its own isolated workspace with role-based access for the entire team' },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 150}>
                <div className="bg-card rounded-2xl p-6 border border-border text-center hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(61,184,61,0.12)] hover:border-sw-green-300 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sw-green-100 to-sw-green-300/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-sw-green-700" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={500}>
            <p className="text-center text-xl font-semibold text-primary mt-12 italic">&ldquo;One platform. Every farm. Every buyer.&rdquo;</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(120 50% 48%), hsl(120 67% 37%))' }}>
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 1440 300" fill="none">
            <pattern id="missionHex" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="1440" height="300" fill="url(#missionHex)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <AnimatedSection>
            <blockquote className="text-center">
              <Lightbulb className="w-12 h-12 text-accent mx-auto mb-6 drop-shadow-lg" />
              <p className="text-2xl md:text-3xl font-medium text-white italic leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                &ldquo;To digitise Pakistan&apos;s livestock industry — giving every farm a digital home and every buyer instant access to verified livestock.&rdquo;
              </p>
            </blockquote>
          </AnimatedSection>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">Team & Supervision</h2>
            <p className="text-center text-muted-foreground mb-4">The people behind Saarway</p>
            <div className="w-16 h-1 bg-gradient-to-r from-sw-green-300 to-primary rounded-full mx-auto mb-14" />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Muhammad Talal Khan', role: 'Founder & CEO', desc: 'Visionary behind Saarway, turning a semester idea into Pakistan\'s first livestock ERP' },
              { name: 'Rana Muhammad Ajmal', role: 'Project Supervisor', desc: 'Guiding the Web Development semester project that gave birth to Saarway' },
            ].map((person, i) => (
              <AnimatedSection key={person.name} delay={i * 150}>
                <div className="bg-card rounded-2xl p-8 border border-border text-center hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(61,184,61,0.12)] hover:border-sw-green-300 transition-all duration-300 group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sw-green-100 to-sw-green-300/30 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-10 h-10 text-sw-green-700" />
                  </div>
                  <h3 className="font-bold text-foreground text-xl">{person.name}</h3>
                  <p className="text-sm text-primary font-semibold mb-3">{person.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{person.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection delay={300}>
            <div className="text-center mt-10">
              <span className="inline-block py-3 px-6 rounded-xl bg-sw-green-50 border border-sw-green-100 text-sm text-muted-foreground font-medium">
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
