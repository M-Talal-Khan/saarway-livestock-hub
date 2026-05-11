"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Building2, Loader2, Search } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { TrustScoreBadge } from '@/components/marketplace/TrustScore';
import type { MarketplaceTrustScore } from '@/lib/marketplace-trust';

interface PublicFarm {
  id: string;
  farm_name: string;
  city: string;
  activeListings: number;
  trust_score?: MarketplaceTrustScore;
}

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref} className={`h-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const Farms = () => {
  const [farms, setFarms] = useState<PublicFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetch('/api/farms')
      .then(r => r.json())
      .then(d => setFarms(d.farms ?? []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => {
    const set = new Set(farms.map(f => f.city).filter(Boolean));
    return Array.from(set).sort();
  }, [farms]);

  const filtered = useMemo(() => {
    return farms.filter(f => {
      const matchSearch = !search || f.farm_name.toLowerCase().includes(search.toLowerCase()) || f.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = !cityFilter || f.city === cityFilter;
      return matchSearch && matchCity;
    });
  }, [farms, search, cityFilter]);

  return (
    <main className="pt-28 pb-24 sw-mesh-gradient min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#050f05] mb-6 tracking-tight drop-shadow-xl">Elite Livestock Hub</h1>
          <div className="w-24 h-1.5 bg-sw-green-500 rounded-full mx-auto mt-8 shadow-lg shadow-sw-green-500/20" />
        </div>

        {/* Filters */}
        {!loading && farms.length > 0 && (
          <div className="max-w-2xl mx-auto mb-10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#050f05]/40" />
              <input
                type="text"
                placeholder="Search farms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 text-[#050f05] placeholder:text-[#050f05]/40 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sw-green-500/30 transition-all shadow-sm"
              />
            </div>
            <select
              value={cityFilter}
              onChange={e => setCityFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 text-[#050f05] font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-sw-green-500/30 transition-all shadow-sm appearance-none cursor-pointer min-w-[160px]"
            >
              <option value="">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-sw-green-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[#1a2a1a]/60 font-bold text-lg">
            {farms.length === 0 ? 'No farms registered yet. Check back soon.' : 'No farms match your search.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {filtered.map((farm, i) => (
              <AnimatedSection key={farm.id} delay={i * 80}>
                <Link href={`/farms/${farm.id}`} className="group relative w-full flex-1 bg-[#b2c9ab]/30 backdrop-blur-3xl backdrop-saturate-[1.6] rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 border border-white/30 shadow-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-2xl hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-sw-green-100 flex items-center justify-center shadow-lg shadow-sw-green-100/20 group-hover:scale-110 transition-transform duration-500">
                      <Building2 className="w-8 h-8 text-[#050f05] sw-icon-premium" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-[#050f05] group-hover:text-sw-green-700 transition-colors leading-tight">
                        {farm.farm_name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-[#050f05]/60 font-extrabold text-xs uppercase tracking-[0.15em] mt-1">
                        <MapPin className="w-4 h-4 text-[#050f05]" strokeWidth={3} /> {farm.city}
                      </div>
                      <div className="mt-3">
                        <TrustScoreBadge trustScore={farm.trust_score} />
                      </div>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-10 border-t border-sw-green-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#050f05]/20 uppercase tracking-[0.25em] mb-1">Live Listings</span>
                      <span className="text-2xl font-black text-[#050f05] tracking-tight">{farm.activeListings} Active</span>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-sw-green-100 flex items-center justify-center text-[#050f05] shadow-lg shadow-sw-green-100/30 group-hover:bg-sw-green-500 group-hover:text-white group-hover:shadow-sw-green-500/50 transition-all duration-300">
                      <ArrowRight className="w-7 h-7" />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Farms;
