"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MapPin, Filter, LogIn, Search, ChevronDown, Activity, ArrowRight, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { parsePhotoUrls } from '@/lib/imageUtils';

interface PublicListing {
  id: string;
  asking_price: number;
  photo_url: string | null;
  description: string | null;
  listed_at: string;
  cattle: { cattle_code: string; breed: string; teeth: number; current_weight: number; gender: string; coat_color: string | null } | null;
  stations: { station_name: string; station_tag: string; city: string } | null;
  farms: { id: string; farm_name: string; city: string } | null;
}

const ListingCardCarousel = ({ photoUrl, breed }: { photoUrl: string | null; breed: string | undefined }) => {
  const urls = parsePhotoUrls(photoUrl);
  const [idx, setIdx] = useState(0);

  if (urls.length === 0) {
    return <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🐄</span>;
  }

  if (urls.length === 1) {
    return <img src={urls[0]} alt={breed} className="w-full h-full object-cover rounded-3xl" />;
  }

  const prev = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length); };
  const next = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i + 1) % urls.length); };

  return (
    <div className="relative w-full h-full">
      <img src={urls[idx]} alt={breed} className="w-full h-full object-cover rounded-3xl transition-opacity duration-200" />
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-4 w-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {urls.map((_, i) => (
          <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
};

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'weight', label: 'Weight' },
];

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const Marketplace = () => {
  const { isLoggedIn } = useAuth();
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [breed, setBreed] = useState('');
  const [teeth, setTeeth] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/marketplace')
      .then(r => r.json())
      .then(d => setListings(d.listings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  // Derive filter options from real data
  const breeds = useMemo(() => [...new Set(listings.map(l => l.cattle?.breed).filter(Boolean) as string[])].sort(), [listings]);
  const teethOptions = useMemo(() => [...new Set(listings.map(l => l.cattle?.teeth).filter(v => v != null) as number[])].sort((a, b) => a - b), [listings]);
  const locations = useMemo(() => [...new Set(listings.map(l => l.stations?.city).filter(Boolean) as string[])].sort(), [listings]);

  const filtered = useMemo(() => {
    let result = [...listings];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.cattle?.breed?.toLowerCase().includes(q) ||
        l.farms?.farm_name?.toLowerCase().includes(q) ||
        l.stations?.city?.toLowerCase().includes(q)
      );
    }
    if (breed) result = result.filter(l => l.cattle?.breed === breed);
    if (teeth) result = result.filter(l => l.cattle?.teeth === Number(teeth));
    if (location) result = result.filter(l => l.stations?.city === location);
    if (minPrice) result = result.filter(l => l.asking_price >= Number(minPrice));
    if (maxPrice) result = result.filter(l => l.asking_price <= Number(maxPrice));

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.asking_price - b.asking_price); break;
      case 'price-high': result.sort((a, b) => b.asking_price - a.asking_price); break;
      case 'weight': result.sort((a, b) => (b.cattle?.current_weight ?? 0) - (a.cattle?.current_weight ?? 0)); break;
      default: result.sort((a, b) => new Date(b.listed_at).getTime() - new Date(a.listed_at).getTime());
    }
    return result;
  }, [listings, searchQuery, breed, teeth, location, sortBy, minPrice, maxPrice]);

  const resetFilters = () => {
    setBreed(''); setTeeth(''); setLocation('');
    setMinPrice(''); setMaxPrice(''); setSearchQuery('');
  };

  if (!isLoggedIn) {
    return (
      <main className="pt-32 pb-24 sw-mesh-gradient min-h-screen flex items-center justify-center">
        <div className="bg-[#b2c9ab]/30 backdrop-blur-2xl backdrop-saturate-[1.6] rounded-[3rem] p-12 text-center max-w-md mx-4 border border-white/30 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-sw-green-800/40 group">
          <div className="w-20 h-20 rounded-3xl bg-sw-green-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sw-green-100/20">
            <LogIn className="w-10 h-10 text-[#050f05]" />
          </div>
          <h1 className="text-3xl font-black text-[#050f05] mb-4">Marketplace Access</h1>
          <p className="text-[#1a2a1a]/70 font-medium mb-8">Please log in to browse the premium livestock marketplace and elite listings.</p>
          <Link href="/login" className="block px-8 py-4 rounded-2xl bg-sw-gold-400 text-[#050f05] font-bold hover:brightness-95 transition-all sw-btn-glow sw-ripple text-lg shadow-lg shadow-sw-gold-400/30">
            Login / Sign Up
          </Link>
        </div>
      </main>
    );
  }

  const selectClass = "w-full pl-4 pr-10 py-3 rounded-2xl border border-sw-green-900/10 bg-white/50 text-[#050f05] text-sm font-black focus:outline-none focus:ring-4 focus:ring-sw-green-500/10 transition-all appearance-none cursor-pointer hover:bg-white/80";

  return (
    <main className="pt-28 pb-24 sw-mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-black text-[#050f05] mb-4 tracking-tight drop-shadow-sm">Livestock Marketplace</h1>
            <p className="text-[#1a2a1a]/60 text-lg font-bold">Discover elite breeds and verified livestock from Pakistan's most trusted farms.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#050f05]/40 group-focus-within:text-sw-green-600 transition-colors" />
              <input
                type="text"
                placeholder="Search breeds, farms, cities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-full bg-white/60 border border-sw-green-900/10 focus:outline-none focus:ring-4 focus:ring-sw-green-500/10 text-[#050f05] font-black placeholder:text-[#050f05]/30 transition-all shadow-md"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-sw-green-100 text-[#050f05] font-black transition-all hover:bg-sw-green-200 sw-ripple">
              <Filter className="w-5 h-5" /> Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center p-6 sm:p-10' : 'hidden'} md:block md:relative md:inset-auto md:bg-transparent md:backdrop-blur-none md:p-0 md:w-72 flex-shrink-0`}>
            <div className="relative w-full max-w-md md:max-w-none bg-white/40 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none rounded-[3rem] p-10 md:p-0 border border-white/20 md:border-none shadow-2xl md:shadow-none space-y-8 sticky top-28">
              {showFilters && (
                <button onClick={() => setShowFilters(false)} className="md:hidden absolute top-6 right-6 w-10 h-10 rounded-full bg-sw-green-100 flex items-center justify-center text-[#050f05]">
                  <X className="w-6 h-6" />
                </button>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-sw-green-100 flex items-center justify-center">
                  <Filter className="w-6 h-6 text-[#050f05]" />
                </div>
                <h3 className="text-2xl font-black text-[#050f05]">Filters</h3>
              </div>

              <div className="grid gap-6">
                <div>
                  <label className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest mb-2 block ml-1">Breed</label>
                  <div className="relative">
                    <select value={breed} onChange={e => setBreed(e.target.value)} className={selectClass}>
                      <option value="">All Breeds</option>
                      {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050f05]/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest mb-2 block ml-1">Teeth Count</label>
                  <div className="relative">
                    <select value={teeth} onChange={e => setTeeth(e.target.value)} className={selectClass}>
                      <option value="">All Teeth</option>
                      {teethOptions.map(t => <option key={t} value={t}>{t} teeth</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050f05]/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest mb-2 block ml-1">Location</label>
                  <div className="relative">
                    <select value={location} onChange={e => setLocation(e.target.value)} className={selectClass}>
                      <option value="">All Locations</option>
                      {locations.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050f05]/30 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest mb-2 block ml-1">Price Range (PKR)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="w-full px-4 py-3 rounded-2xl border border-sw-green-900/10 bg-white/50 text-[#050f05] text-sm font-black focus:outline-none focus:ring-4 focus:ring-sw-green-500/10" />
                    <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="w-full px-4 py-3 rounded-2xl border border-sw-green-900/10 bg-white/50 text-[#050f05] text-sm font-black focus:outline-none focus:ring-4 focus:ring-sw-green-500/10" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest mb-2 block ml-1">Sort Results</label>
                  <div className="relative">
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}>
                      {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#050f05]/30 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full pt-8 text-[#050f05]/40 text-xs font-black uppercase tracking-widest hover:text-[#050f05] transition-colors border-t border-sw-green-900/5 text-center"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-32">
                <Loader2 className="w-10 h-10 animate-spin text-sw-green-600" />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filtered.map((listing, i) => (
                    <AnimatedSection key={listing.id} delay={i * 50}>
                      <Link href={`/marketplace/${listing.id}`} className="group relative block bg-[#b2c9ab]/30 backdrop-blur-3xl backdrop-saturate-[1.6] rounded-[2.5rem] p-8 border border-white/30 shadow-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-2xl hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-500 hover:-translate-y-2 h-full flex flex-col">
                        <div className="aspect-[4/3] rounded-3xl bg-white/20 flex items-center justify-center mb-6 overflow-hidden group-hover:bg-white/30 transition-colors">
                          <ListingCardCarousel photoUrl={listing.photo_url} breed={listing.cattle?.breed} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-sw-green-100 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-[#050f05]" />
                              </div>
                              <span className="text-sm font-black text-[#050f05]">{listing.cattle?.breed ?? '—'}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#050f05]/40 uppercase tracking-widest">{listing.cattle?.teeth ?? '—'} Teeth</span>
                          </div>

                          <h3 className="text-2xl font-black text-[#050f05] mb-2">{formatPrice(listing.asking_price)}</h3>
                          <p className="text-[#1a2a1a]/60 text-sm font-bold mb-6 italic">
                            {listing.cattle?.current_weight} kg · {listing.cattle?.gender} · {listing.cattle?.teeth} teeth
                          </p>

                          <div className="flex items-center gap-2 text-[10px] font-black text-[#050f05]/60 uppercase tracking-widest pt-6 border-t border-sw-green-100/30">
                            <MapPin className="w-3.5 h-3.5 text-[#050f05]" />
                            <span className="line-clamp-1">{listing.farms?.farm_name}, {listing.stations?.city}</span>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                          <span className="text-sm font-black text-sw-green-600">View Details</span>
                          <div className="w-10 h-10 rounded-full bg-sw-green-100 flex items-center justify-center text-[#050f05] group-hover:bg-sw-green-500 group-hover:text-white transition-all duration-300">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>
                      </Link>
                    </AnimatedSection>
                  ))}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-32 sw-glass-hover-gradient rounded-[3rem] border border-dashed border-sw-green-900/10">
                    <Search className="w-16 h-16 text-sw-green-200 mx-auto mb-6" />
                    <h3 className="text-2xl font-black text-[#050f05] mb-2">
                      {listings.length === 0 ? 'No listings available' : 'No matching listings'}
                    </h3>
                    <p className="text-[#1a2a1a]/60 font-bold max-w-xs mx-auto">
                      {listings.length === 0
                        ? 'Check back soon — farms are getting ready to list.'
                        : 'Try adjusting your filters or search keywords.'}
                    </p>
                    {listings.length > 0 && (
                      <button onClick={resetFilters} className="mt-8 px-8 py-3 rounded-full bg-sw-green-600 text-white font-bold sw-ripple shadow-lg shadow-sw-green-600/20">
                        Reset Search
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Marketplace;
