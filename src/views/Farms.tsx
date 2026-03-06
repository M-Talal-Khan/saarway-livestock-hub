"use client";

import Link from 'next/link';
import { MapPin, ArrowRight, Building2, Beef, Milk, Activity } from 'lucide-react';
import { farms } from '@/data/farms';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Farms = () => {
  return (
    <main className="pt-28 pb-24 sw-mesh-gradient min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#050f05] mb-6 tracking-tight drop-shadow-xl">Elite Livestock Hub</h1>
          <div className="w-24 h-1.5 bg-sw-green-500 rounded-full mx-auto mt-8 shadow-lg shadow-sw-green-500/20" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {farms.map((farm, i) => (
            <AnimatedSection key={farm.id} delay={i * 80}>
              <Link href={`/farms/${farm.id}`} className="group relative block bg-[#b2c9ab]/30 backdrop-blur-3xl backdrop-saturate-[1.6] rounded-[3rem] p-12 border border-white/30 shadow-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-2xl hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                {/* Header Section */}
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-sw-green-100 flex items-center justify-center shadow-lg shadow-sw-green-100/20 group-hover:scale-110 transition-transform duration-500">
                    <Building2 className="w-8 h-8 text-[#050f05] sw-icon-premium" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-black text-[#050f05] group-hover:text-sw-green-700 transition-colors leading-tight">
                      {farm.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-[#050f05]/60 font-extrabold text-xs uppercase tracking-[0.15em] mt-1">
                      <MapPin className="w-4 h-4 text-[#050f05]" strokeWidth={3} /> {farm.city}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="p-4 rounded-3xl bg-white/20 border border-sw-green-100/20 hover:bg-white/40 transition-colors">
                    <div className="flex items-center gap-3 mb-1">
                      {farm.farmingType === 'Meat' ? <Beef className="w-5 h-5 text-[#050f05]" /> : <Milk className="w-5 h-5 text-[#050f05]" />}
                      <span className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest">Type</span>
                    </div>
                    <span className="text-sm font-black text-[#1a2a1a]">{farm.farmingType}</span>
                  </div>
                  <div className="p-4 rounded-3xl bg-white/20 border border-sw-green-100/20 hover:bg-white/40 transition-colors">
                    <div className="flex items-center gap-3 mb-1">
                      <Activity className="w-5 h-5 text-[#050f05]" />
                      <span className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest">Inventory</span>
                    </div>
                    <span className="text-sm font-black text-[#1a2a1a]">{farm.totalAnimals}+ Head</span>
                  </div>
                </div>

                <p className="text-[#1a2a1a]/70 text-lg leading-relaxed font-semibold mb-12 flex-1 line-clamp-3 italic">
                  "{farm.description}"
                </p>

                {/* Footer Section */}
                <div className="flex items-center justify-between pt-10 border-t border-sw-green-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#050f05]/20 uppercase tracking-[0.25em] mb-1">Live Listings</span>
                    <span className="text-2xl font-black text-[#050f05] tracking-tight">{farm.listings} Active</span>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-sw-green-100 flex items-center justify-center text-[#050f05] shadow-lg shadow-sw-green-100/30 group-hover:bg-sw-green-500 group-hover:text-white group-hover:shadow-sw-green-500/50 transition-all duration-300">
                    <ArrowRight className="w-7 h-7" />
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Farms;
