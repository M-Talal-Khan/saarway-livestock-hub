"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Factory, Beef, MapPin, Dna, ArrowRight, Lock, Milk, UtensilsCrossed, ChevronDown } from 'lucide-react';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';
import Typewriter from 'typewriter-effect';

interface FarmRow { id: string; farm_name: string; city: string; activeListings: number; }
interface Stats { farmCount: number; animalCount: number; cityCount: number; breedCount: number; }

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
        <Icon className="w-7 h-7 text-sw-green-700 sw-icon-premium" />
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<Stats>({ farmCount: 0, animalCount: 0, cityCount: 0, breedCount: 0 });
  const [featuredFarms, setFeaturedFarms] = useState<FarmRow[]>([]);

  const slides = [
    '/images/home_slider/slide1.webp',
    '/images/home_slider/slide2.webp',
    '/images/home_slider/slide3.webp'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => {
      if (d.farmCount !== undefined) setStats(d);
    }).catch(() => { });
    fetch('/api/farms').then(r => r.json()).then(d => {
      setFeaturedFarms((d.farms ?? []).slice(0, 4));
    }).catch(() => { });
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black">
        {/* Animated Slideshow Background */}
        <div className="absolute inset-0 w-full h-full">
          {slides.map((slide, index) => (
            <div
              key={slide}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={slide}
                alt={`Saarway Hero ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                quality={90}
              />
            </div>
          ))}
        </div>

        {/* Lighter Gradient Overlay for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60 z-10" />

        {/* Content */}
        <div className="container mx-auto px-4 pt-20 pb-16 relative z-20 flex flex-col items-center">
          {/* Glassmorphic Card Overlay - Reduced intensity */}
          <div className="max-w-4xl mx-auto text-center bg-black/30 backdrop-blur-sm border border-white/10 p-8 md:p-14 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
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

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-[1.15] drop-shadow-md min-h-[140px] md:min-h-[160px] lg:min-h-[170px] flex items-center justify-center">
              <Typewriter
                options={{
                  strings: [
                    'Pakistan\'s First <span class="text-sw-green-400">Livestock ERP</span>',
                    'Pakistan\'s First <span class="text-sw-green-400">Marketplace</span>',
                    'Pakistan\'s First <span class="text-sw-gold-400">Digital Farm</span>'
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 60,
                  deleteSpeed: 30
                }}
              />
            </h1>

            <p className="text-lg md:text-xl text-white mb-10 font-bold max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              Manage your entire farm digitally. Track cattle, monitor health, handle finances, and connect with buyers directly — all seamlessly in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-8">
              <Link
                href="/marketplace"
                className="group px-8 py-4 rounded-xl font-extrabold text-sw-green-950 bg-white hover:bg-sw-green-50 shadow-lg transition-all duration-300 flex items-center justify-center gap-2 sw-ripple"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform sw-icon-premium" />
              </Link>
              {/* distinct green button */}
              <Link
                href="/register-farm"
                style={{ backgroundColor: '#16a34a' }}
                className="px-8 py-4 rounded-xl font-extrabold text-white hover:bg-[#15803d] shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,74,0.23)] hover:-translate-y-0.5 transition-all duration-300 transform sw-ripple"
              >
                Register Your Farm
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-white/80 z-20">
          <ChevronDown className="w-8 h-8 drop-shadow-md" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-background relative border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 -mt-12 relative z-10">
            <StatCard icon={Factory} label="Farms Onboarded" value={stats.farmCount} delay={0} />
            <StatCard icon={Beef} label="Animals Listed" value={stats.animalCount} delay={100} />
            <StatCard icon={MapPin} label="Cities Covered" value={stats.cityCount} delay={200} />
            <StatCard icon={Dna} label="Breeds Available" value={stats.breedCount} delay={300} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight">How It Works</h2>
            <p className="text-center text-sw-green-950/70 mb-6 max-w-lg mx-auto font-medium text-lg">Digitising your farm in three simple steps</p>
            <div className="w-20 h-1.5 bg-sw-green-500 rounded-full mx-auto mb-16" />
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-sw-green-200" />
            {[
              { step: 1, title: 'Register Your Farm', desc: 'Secure your unique Farm ID and get access to your dedicated ERP workspace.' },
              { step: 2, title: 'Manage Inventory', desc: 'Add your cattle with photos, health records, and asking price.' },
              { step: 3, title: 'Connect with Buyers', desc: 'Publish listings publicly and let verified buyers contact you via WhatsApp.' },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 150}>
                {/* Applied sw-glass-hover-gradient here for premium feel */}
                <div className="sw-glass-hover-gradient rounded-3xl p-8 text-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-sw-green-50 text-sw-green-600 flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-sm border border-sw-green-100 relative z-10">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-sw-green-950 mb-3">{item.title}</h3>
                  <p className="text-base text-sw-green-950/70 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story Teaser */}
      <section className="py-24 relative overflow-hidden bg-sw-green-50">
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none">
            <pattern id="hexPatternTeaser" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="1440" height="800" fill="url(#hexPatternTeaser)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <AnimatedSection>
            {/* Applied sw-glass-hover-gradient here */}
            <div className="sw-glass-hover-gradient p-10 md:p-14 rounded-3xl text-center">
              <div className="text-sw-green-600 mb-6 flex justify-center">
                <Dna className="w-12 h-12" />
              </div>
              <p className="text-2xl md:text-3xl text-sw-green-950 italic mb-10 leading-relaxed font-semibold">
                "Saarway began as a university project with a simple question — what if a farmer in Kasur could list his cattle, and a buyer in Lahore could find him in seconds?"
              </p>
              <Link href="/about" style={{ backgroundColor: '#16a34a' }} className="inline-flex items-center justify-center gap-2 text-white font-extrabold px-8 py-4 rounded-xl hover:bg-[#15803d] shadow-md transition-all group sw-ripple">
                Read Our Story <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform sw-icon-premium" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Farms */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-sw-green-950 mb-3 tracking-tight">Farms on Saarway</h2>
            <p className="text-center text-sw-green-950/70 mb-6 max-w-lg mx-auto font-medium text-lg">Trusted farms from across Pakistan</p>
            <div className="w-20 h-1.5 bg-sw-green-500 rounded-full mx-auto mb-16" />
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredFarms.length === 0 ? (
              [0, 1, 2, 3].map(i => (
                <div key={i} className="sw-glass-hover-gradient rounded-3xl h-48 animate-pulse bg-sw-green-50" />
              ))
            ) : featuredFarms.map((farm, i) => (
              <AnimatedSection key={farm.id} delay={i * 100}>
                <Link href={`/farms/${farm.id}`} className="group block sw-glass-hover-gradient rounded-3xl overflow-hidden h-full">
                  <div className="h-2 bg-gradient-to-r from-sw-green-400 to-sw-green-600 w-0 group-hover:w-full transition-all duration-500" />
                  <div className="p-8">
                    <h3 className="font-bold text-sw-green-950 text-xl mb-2">{farm.farm_name}</h3>
                    <p className="text-sm text-sw-green-700 font-semibold flex items-center gap-1.5 mb-4">
                      <MapPin className="w-4 h-4" /> {farm.city}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-black/5 mt-6">
                      <span className="inline-flex text-xs font-bold bg-white/80 text-sw-green-700 px-3 py-1.5 rounded-lg border border-sw-green-200">
                        {farm.activeListings} active listing{farm.activeListings !== 1 ? 's' : ''}
                      </span>
                      <ArrowRight className="w-5 h-5 text-sw-green-400 group-hover:text-sw-green-700 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/farms" className="inline-flex items-center justify-center gap-2 bg-white border-2 border-sw-green-600 text-sw-green-700 font-extrabold px-8 py-3 rounded-xl hover:bg-sw-green-50 hover:shadow-md transition-all group sw-ripple">
              View All Farms <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform sw-icon-premium" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Modules */}
      {/* Background is now a dark landscape to contrast the darker glass cards */}
      <section className="py-24 bg-sw-green-950 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, hsl(120 75% 15%), hsl(120 80% 8%))' }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sw-green-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sw-gold-400/10 blur-[100px] rounded-full" />

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            {/* Fixed visibility by ensuring crisp white text */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3 tracking-tight text-white drop-shadow-md">Coming Soon</h2>
            <p className="text-center text-white/80 mb-6 max-w-lg mx-auto font-medium text-lg drop-shadow-sm">New features currently in development</p>
            <div className="w-20 h-1.5 bg-sw-gold-400 rounded-full mx-auto mb-16 shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Milk, title: 'Dairy Module', desc: 'Daily milk production tracking, per-cow yield reports, and dairy income integration.' },
              { icon: UtensilsCrossed, title: 'Butchery Module', desc: 'Manage meat processing, custom packaging, specific cuts, and B2B meat sales.' },
            ].map((mod, i) => (
              <AnimatedSection key={mod.title} delay={i * 150}>
                {/* Fixed visibility: used sw-glass-dark here so it is darker than the footer and provides great contrast for white text */}
                <div className="sw-glass-dark rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs bg-sw-gold-400 text-sw-green-950 px-3 py-1.5 rounded-full font-bold shadow-md">
                    <Lock className="w-3.5 h-3.5" /> Coming Soon
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                      <mod.icon className="w-7 h-7 text-sw-gold-400" />
                    </div>
                    {/* High contrast text */}
                    <h3 className="text-2xl font-bold mb-3 text-white">{mod.title}</h3>
                    <p className="text-base text-white/80 leading-relaxed font-semibold">{mod.desc}</p>
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
