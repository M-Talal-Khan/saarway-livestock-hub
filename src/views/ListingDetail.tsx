"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, ArrowLeft, Loader2, ChevronLeft, ChevronRight, X, LogIn, Tag, Beef, Smile, Weight, PawPrint, Palette, CalendarDays, FileText, Building2, Navigation } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { parsePhotoUrls } from '@/lib/imageUtils';
import { TrustScoreBadge, TrustScorePanel } from '@/components/marketplace/TrustScore';
import type { MarketplaceTrustScore } from '@/lib/marketplace-trust';

interface ListingDetail {
  id: string;
  asking_price: number;
  photo_url: string | null;
  description: string | null;
  listed_at: string;
  farm_id: string;
  trust_score?: MarketplaceTrustScore;
  cattle: { cattle_code: string; breed: string; teeth: number; current_weight: number; gender: string; coat_color: string | null } | null;
  stations: { station_name: string; station_tag: string; city: string } | null;
  farms: { id: string; farm_name: string; city: string; is_active?: boolean; onboarded_at?: string | null } | null;
}

interface MoreListing {
  id: string;
  asking_price: number;
  photo_url: string | null;
  cattle: { breed: string; current_weight: number } | null;
}

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const PhotoGallery = ({ photoUrl, breed }: { photoUrl: string | null; breed: string | undefined }) => {
  const urls = parsePhotoUrls(photoUrl);
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (urls.length === 0) {
    return (
      <div className="h-64 md:h-[28rem] bg-white/30 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mb-6 border border-white/40">
        <span className="text-7xl">🐄</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        <div className="relative h-64 md:h-[28rem] bg-white/20 rounded-[2rem] overflow-hidden group cursor-zoom-in border border-white/40" onClick={() => setLightbox(true)}>
          <img src={urls[idx]} alt={breed} loading="lazy" className="w-full h-full object-contain transition-opacity duration-200" />
          {urls.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % urls.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next photo"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {idx + 1} / {urls.length}
              </span>
            </>
          )}
        </div>
        {urls.length > 1 && (
          <div className="flex gap-2">
            {urls.map((url, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === idx ? 'border-sw-green-500 shadow-md' : 'border-white/40 hover:border-sw-green-300/60'}`}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={url} alt={`${breed} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80">
            <X className="h-6 w-6" />
          </button>
          {urls.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + urls.length) % urls.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80">
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          <img src={urls[idx]} alt={breed} className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          {urls.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % urls.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-black/80">
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">{idx + 1} / {urls.length}</span>
        </div>
      )}
    </>
  );
};

const parseWaNumber = (description: string | null): string => {
  if (!description) return '';
  const match = description.match(/^\[wa:(\S+)\]/);
  return match ? match[1] : '';
};

const stripWaTag = (description: string | null): string => {
  if (!description) return '';
  return description.replace(/^\[wa:\S+\]\s*/, '');
};

const WhatsAppButton = ({ listingId, breed, description }: { listingId: string; breed: string; description: string | null }) => {
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const phone = parseWaNumber(description);
  const waNumber = phone ? phone.replace(/^0/, '92') : '';
  const listingUrl = origin ? `${origin}/marketplace/${listingId}` : `https://saarway.com/marketplace/${listingId}`;

  return (
    <a
      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in your ${breed} listed on Saarway.\n\nHere is the link: ${listingUrl}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow"
      aria-label="Contact farm via WhatsApp"
    >
      <Phone className="w-5 h-5" /> Contact Farm via WhatsApp
    </a>
  );
};

const ListingDetailView = () => {
  const { id } = useParams();
  const { isLoggedIn, buyerLoading } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [moreListing, setMoreListing] = useState<MoreListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/marketplace/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setListing(d.listing);
        setMoreListing(d.moreListing ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || buyerLoading) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="pt-32 pb-24 sw-mesh-gradient min-h-screen flex items-center justify-center">
        <div className="bg-[#b2c9ab]/30 backdrop-blur-2xl backdrop-saturate-[1.6] rounded-[3rem] p-12 text-center max-w-md mx-4 border border-white/30 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-sw-green-800/40 group">
          <div className="w-20 h-20 rounded-3xl bg-sw-green-100 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sw-green-100/20">
            <LogIn className="w-10 h-10 text-[#050f05]" />
          </div>
          <h1 className="text-3xl font-black text-[#050f05] mb-4">Marketplace Access</h1>
          <p className="text-[#1a2a1a]/70 font-medium mb-8">Please log in to view livestock details, prices, and contact information.</p>
          <Link href="/login" className="block px-8 py-4 rounded-2xl bg-sw-gold-400 text-[#050f05] font-bold hover:brightness-95 transition-all sw-btn-glow sw-ripple text-lg shadow-lg shadow-sw-gold-400/30">
            Login / Sign Up
          </Link>
        </div>
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Listing not found</h1>
          <Link href="/marketplace" className="text-primary mt-4 inline-block">← Back to Marketplace</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 sw-mesh-gradient min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#050f05]/60 hover:text-[#050f05] transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
        </Link>

        {/* ── Hero: Two-Column Layout ── */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-10">
          {/* Left Column — Photo */}
          <div>
            <PhotoGallery photoUrl={listing.photo_url} breed={listing.cattle?.breed} />
          </div>

          {/* Right Column — Key Info */}
          <div className="flex flex-col gap-6">
            {/* Breed badge + teeth */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sw-green-100 text-sm font-bold text-[#050f05]">
                <Beef className="w-4 h-4" /> {listing.cattle?.breed ?? 'Unknown Breed'}
              </span>
              {listing.cattle?.teeth != null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#050f05]/5 text-xs font-bold text-[#050f05]/70">
                  <Smile className="w-3.5 h-3.5" /> {listing.cattle.teeth} Teeth
                </span>
              )}
            </div>

            {/* Price */}
            <h1 className="text-4xl md:text-5xl font-black text-[#050f05] tracking-tight">{formatPrice(listing.asking_price)}</h1>

            {/* Trust Badge */}
            <TrustScoreBadge trustScore={listing.trust_score} />

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Weight className="w-4 h-4" />, label: 'Weight', value: listing.cattle?.current_weight ? `${listing.cattle.current_weight} kg` : '—' },
                { icon: <PawPrint className="w-4 h-4" />, label: 'Gender', value: listing.cattle?.gender ?? '—' },
                { icon: <Palette className="w-4 h-4" />, label: 'Color', value: listing.cattle?.coat_color ?? '—' },
              ].map(s => (
                <div key={s.label} className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/40 text-center">
                  <div className="flex items-center justify-center text-[#050f05]/40 mb-1.5">{s.icon}</div>
                  <p className="text-[10px] font-bold text-[#050f05]/40 uppercase tracking-widest">{s.label}</p>
                  <p className="text-sm font-black text-[#050f05] mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            {/* WhatsApp Contact */}
            <WhatsAppButton listingId={listing.id} breed={listing.cattle?.breed ?? 'livestock'} description={listing.description} />

            {/* Farm Link (compact) */}
            <Link href={`/farms/${listing.farms?.id}`} className="flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/40 hover:border-sw-green-300/40 transition-all group/farm">
              <div className="w-10 h-10 rounded-xl bg-sw-green-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-[#050f05]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#050f05] group-hover/farm:text-sw-green-700 transition-colors truncate">{listing.farms?.farm_name ?? '—'}</p>
                <p className="text-xs text-[#050f05]/50 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" /> {listing.stations?.city ?? listing.farms?.city ?? '—'}
                </p>
              </div>
              <ArrowLeft className="w-4 h-4 ml-auto text-[#050f05]/30 rotate-180 group-hover/farm:translate-x-1 transition-transform flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* ── Details Sections ── */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Animal Details — spans 2 cols */}
          <section className="lg:col-span-2 bg-white/50 backdrop-blur-xl rounded-[2rem] p-8 border border-white/40 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sw-green-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-[#050f05]" />
              </div>
              <h2 className="text-xl font-black text-[#050f05]">Animal Details</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Tag className="w-4 h-4" />, label: 'Cattle Code', value: listing.cattle?.cattle_code ?? '—' },
                { icon: <Beef className="w-4 h-4" />, label: 'Breed', value: listing.cattle?.breed ?? '—' },
                { icon: <Smile className="w-4 h-4" />, label: 'Teeth', value: listing.cattle?.teeth?.toString() ?? '—' },
                { icon: <Weight className="w-4 h-4" />, label: 'Weight', value: listing.cattle?.current_weight ? `${listing.cattle.current_weight} kg` : '—' },
                { icon: <PawPrint className="w-4 h-4" />, label: 'Gender', value: listing.cattle?.gender ?? '—' },
                { icon: <Palette className="w-4 h-4" />, label: 'Coat Color', value: listing.cattle?.coat_color ?? '—' },
                { icon: <CalendarDays className="w-4 h-4" />, label: 'Listed', value: new Date(listing.listed_at).toLocaleDateString('en-PK') },
              ].map(item => (
                <div key={item.label} className="bg-[#050f05]/[0.02] rounded-xl p-4 border border-[#050f05]/[0.04]">
                  <div className="flex items-center gap-2 text-[#050f05]/40 mb-2">{item.icon}<span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span></div>
                  <p className="font-bold text-[#050f05] text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Farm Details — right column (small) */}
          <section className="bg-white/50 backdrop-blur-xl rounded-[2rem] p-8 border border-white/40 shadow-lg flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sw-green-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#050f05]" />
              </div>
              <h2 className="text-xl font-black text-[#050f05]">Farm Details</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sw-green-100/60 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#050f05]/60" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#050f05]/40 uppercase tracking-widest">Farm Name</p>
                  <Link href={`/farms/${listing.farms?.id}`} className="text-sm font-bold text-sw-green-700 hover:underline">{listing.farms?.farm_name ?? '—'}</Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sw-green-100/60 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-[#050f05]/60" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#050f05]/40 uppercase tracking-widest">City</p>
                  <p className="text-sm font-bold text-[#050f05]">{listing.stations?.city ?? listing.farms?.city ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sw-green-100/60 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-[#050f05]/60" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#050f05]/40 uppercase tracking-widest">Station</p>
                  <p className="text-sm font-bold text-[#050f05]">{listing.stations?.station_name ?? '—'}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── Description + Trust Score Row (mirrors Animal Details + Farm Details) ── */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Description — spans 2 cols */}
          <section className="lg:col-span-2 bg-white/50 backdrop-blur-xl rounded-[2rem] p-8 border border-white/40 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-sw-green-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#050f05]" />
              </div>
              <h2 className="text-xl font-black text-[#050f05]">Description</h2>
            </div>
            {stripWaTag(listing.description) ? (
              <p className="text-[#050f05]/70 leading-relaxed text-[15px] whitespace-pre-line">{stripWaTag(listing.description)}</p>
            ) : (
              <p className="text-[#050f05]/30 italic text-sm">No description provided for this listing.</p>
            )}
          </section>

          {/* Trust Score — right column (small, same size as Farm Details) */}
          <div>
            <TrustScorePanel trustScore={listing.trust_score} />
          </div>
        </div>

        {/* ── More from this farm ── */}
        {moreListing.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-[#050f05] mb-6">More from {listing.farms?.farm_name}</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {moreListing.map(l => (
                <Link key={l.id} href={`/marketplace/${l.id}`} className="group bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/40 overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="h-36 bg-sw-green-100/30 flex items-center justify-center overflow-hidden">
                    {l.photo_url ? (() => {
                      const src = l.photo_url!.startsWith('[') ? JSON.parse(l.photo_url!)[0] : l.photo_url;
                      return <img src={src} alt={l.cattle?.breed} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />;
                    })() : (
                      <span className="text-4xl">🐄</span>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-bold text-[#050f05]">{l.cattle?.breed} · {l.cattle?.current_weight}kg</p>
                    <p className="font-black text-sw-green-700 mt-1">{formatPrice(l.asking_price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );

};

export default ListingDetailView;
