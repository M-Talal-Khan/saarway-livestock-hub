"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Factory, Beef, MapPin, Dna, ArrowRight, Lock, Milk, UtensilsCrossed, ChevronDown } from 'lucide-react';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';
import { farms } from '@/data/farms';

const StatCard = ({ icon: Icon, label, value, delay = 0 }: { icon: any; label: string; value: number; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const count = useCountUp(value, 1500, isVisible);
  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl p-6 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(61,184,61,0.2)] border border-primary/15 bg-white/80 backdrop-blur-lg ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-sw-green-100 to-sw-green-300/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-sw-green-700" />
      </div>
      <p className="text-4xl font-extrabold text-sw-green-900">{count}</p>
      <p className="text-sm text-muted-foreground mt-1 font-medium">{label}</p>
    </div>
  );
};

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  return (
    <main>
      {/* Hero */}
      <section className="min-h-screen flex items-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(120 50% 48%) 0%, hsl(120 67% 37%) 40%, hsl(120 75% 21%) 100%)' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none">
            <pattern id="hexPattern" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
            <rect width="1440" height="800" fill="url(#hexPattern)" />
          </svg>
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-[10%] w-72 h-72 rounded-full bg-white/[0.04] blur-3xl animate-[swFloat_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-1/4 right-[15%] w-56 h-56 rounded-full bg-white/[0.06] blur-3xl animate-[swFloat_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-white/[0.03] blur-3xl animate-[swFloat_12s_ease-in-out_infinite_4s]" />

        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Logo */}
            <div className="sw-fade-in mb-8">
              <Image
                src="/images/logo-icon.png"
                alt="Saarway"
                width={90}
                height={90}
                className="mx-auto brightness-0 invert drop-shadow-[0_4px_20px_rgba(255,255,255,0.3)]"
                priority
              />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-[1.1] sw-fade-in-up" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.2)' }}>
              Pakistan&apos;s First Livestock
              <span className="block bg-gradient-to-r from-white via-sw-gold-400 to-white bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text' }}>
                ERP & Marketplace
              </span>
            </h1>

            <p className="text-base md:text-lg text-white/75 mb-3 sw-fade-in-up italic font-medium tracking-wide" style={{ animationDelay: '150ms' }}>
              Farm. Track. Thrive.
            </p>

            <p className="text-lg md:text-xl text-white/80 mb-10 sw-fade-in-up font-normal max-w-2xl mx-auto" style={{ animationDelay: '250ms' }}>
              Manage your entire farm operation digitally — track cattle, monitor health, handle finances, and list animals for sale. All in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center sw-fade-in-up" style={{ animationDelay: '400ms' }}>
              <Link
                href="/marketplace"
                className="group px-8 py-3.5 rounded-xl font-semibold text-white border border-white/30 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-white/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              >
                Browse Marketplace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register-farm"
                className="px-8 py-3.5 rounded-xl font-semibold bg-accent text-accent-foreground hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,194,74,0.35)] transition-all duration-300"
              >
                Register Your Farm
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/40">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-background relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-12 relative z-10">
            <StatCard icon={Factory} label="Farms Onboarded" value={12} delay={0} />
            <StatCard icon={Beef} label="Animals Listed" value={340} delay={100} />
            <StatCard icon={MapPin} label="Cities Covered" value={8} delay={200} />
            <StatCard icon={Dna} label="Breeds Available" value={15} delay={300} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-sw-green-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">How It Works</h2>
            <p className="text-center text-muted-foreground mb-4 max-w-lg mx-auto">Get started in three simple steps</p>
            <div className="w-16 h-1 bg-gradient-to-r from-sw-green-300 to-primary rounded-full mx-auto mb-14" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-[2px] border-t-2 border-dashed border-primary/30" />
            {[
              { step: 1, title: 'Register Your Farm', desc: 'Sign up and get your unique Farm ID within 48 hours' },
              { step: 2, title: 'List Your Animals', desc: 'Add cattle with photos, details, and asking price' },
              { step: 3, title: 'Connect with Buyers', desc: 'Buyers contact you directly via WhatsApp' },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 150}>
                <div className="bg-card rounded-2xl p-6 text-center border border-border shadow-sm hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(61,184,61,0.12)] transition-all duration-300 relative group">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sw-green-500 to-sw-green-700 text-white flex items-center justify-center font-bold text-lg mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story Teaser */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(120 50% 96%) 0%, hsl(0 0% 100%) 100%)' }}>
        <div className="container mx-auto px-4 text-center max-w-2xl relative">
          <AnimatedSection>
            <div className="relative">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[120px] text-sw-green-100 font-serif leading-none select-none">&ldquo;</div>
              <p className="text-xl md:text-2xl text-foreground italic mb-8 relative z-10 pt-12 leading-relaxed font-light">
                Saarway began as a semester project with a simple question — what if a farmer in Kasur could list his cattle and a buyer in Lahore could find him in seconds?
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:gap-3 transition-all group">
                Read Our Story <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Farms */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">Farms on Saarway</h2>
            <p className="text-center text-muted-foreground mb-4 max-w-lg mx-auto">Trusted farms from across Pakistan</p>
            <div className="w-16 h-1 bg-gradient-to-r from-sw-green-300 to-primary rounded-full mx-auto mb-14" />
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {farms.slice(0, 4).map((farm, i) => (
              <AnimatedSection key={farm.id} delay={i * 100}>
                <Link href={`/farms/${farm.id}`} className="group block bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:-translate-y-2 hover:shadow-[0_12px_32px_rgba(61,184,61,0.12)] hover:border-sw-green-300 transition-all duration-300">
                  <div className="h-1.5 bg-gradient-to-r from-sw-green-300 via-primary to-sw-green-700 group-hover:h-2 transition-all duration-300" />
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground text-lg mb-1">{farm.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" /> {farm.city}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{farm.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-xs font-medium bg-sw-green-100 text-sw-green-900 px-3 py-1 rounded-full">
                        {farm.listings} listings
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/farms" className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:gap-3 transition-all group">
              View All Farms <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Modules */}
      <section className="py-20 bg-sw-green-50">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-2">Coming Soon</h2>
            <p className="text-center text-muted-foreground mb-4 max-w-lg mx-auto">New modules on the horizon</p>
            <div className="w-16 h-1 bg-gradient-to-r from-sw-green-300 to-primary rounded-full mx-auto mb-14" />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Milk, title: 'Dairy Module', desc: 'Daily milk production tracking, per-cow reports, dairy income integration' },
              { icon: UtensilsCrossed, title: 'Butchery Module', desc: 'Meat processing, packaging, cuts management, direct meat sales' },
            ].map((mod, i) => (
              <AnimatedSection key={mod.title} delay={i * 150}>
                <div className="group rounded-2xl p-6 border border-primary/10 relative overflow-hidden bg-white/70 backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(61,184,61,0.1)] hover:border-sw-green-300 transition-all duration-300">
                  {/* Diagonal stripe pattern */}
                  <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)' }} />
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-accent/20 text-accent-foreground px-2.5 py-1 rounded-full font-medium">
                    <Lock className="w-3 h-3" /> Coming Soon
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-sw-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <mod.icon className="w-6 h-6 text-sw-green-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
