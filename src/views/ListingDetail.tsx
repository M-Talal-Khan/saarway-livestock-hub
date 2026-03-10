"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, ArrowLeft, Loader2, ChevronLeft, ChevronRight, X, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { parsePhotoUrls } from '@/lib/imageUtils';

interface ListingDetail {
  id: string;
  asking_price: number;
  photo_url: string | null;
  description: string | null;
  listed_at: string;
  farm_id: string;
  cattle: { cattle_code: string; breed: string; teeth: number; current_weight: number; gender: string; coat_color: string | null } | null;
  stations: { station_name: string; station_tag: string; city: string } | null;
  farms: { id: string; farm_name: string; city: string } | null;
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
      <div className="h-64 md:h-96 bg-secondary rounded-xl flex items-center justify-center mb-6">
        <span className="text-7xl">🐄</span>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        {/* Main image */}
        <div className="relative h-64 md:h-96 bg-secondary rounded-xl overflow-hidden group cursor-zoom-in" onClick={() => setLightbox(true)}>
          <img src={urls[idx]} alt={breed} className="w-full h-full object-cover transition-opacity duration-200" />
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
        {/* Thumbnails */}
        {urls.length > 1 && (
          <div className="flex gap-2">
            {urls.map((url, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${i === idx ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={url} alt={`${breed} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
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

  // Wait for auth to settle or listing to load
  if (loading || buyerLoading) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  // If auth has settled and user is not logged in, show the gate
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
    <main className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Photo Gallery */}
        <PhotoGallery photoUrl={listing.photo_url} breed={listing.cattle?.breed} />

        {/* Price */}
        <h1 className="text-3xl font-bold text-primary mb-4">{formatPrice(listing.asking_price)}</h1>

        {/* WhatsApp Top */}
        <div className="mb-8">
          <WhatsAppButton listingId={listing.id} breed={listing.cattle?.breed ?? 'livestock'} description={listing.description} />
        </div>

        {/* Details Grid */}
        <section className="bg-card rounded-xl p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Animal Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Cattle Code', value: listing.cattle?.cattle_code ?? '—' },
              { label: 'Breed', value: listing.cattle?.breed ?? '—' },
              { label: 'Teeth', value: listing.cattle?.teeth?.toString() ?? '—' },
              { label: 'Weight', value: listing.cattle?.current_weight ? `${listing.cattle.current_weight} kg` : '—' },
              { label: 'Gender', value: listing.cattle?.gender ?? '—' },
              { label: 'Coat Color', value: listing.cattle?.coat_color ?? '—' },
              { label: 'Listed', value: new Date(listing.listed_at).toLocaleDateString('en-PK') },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        {stripWaTag(listing.description) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">Description</h2>
            <p className="text-muted-foreground">{stripWaTag(listing.description)}</p>
          </section>
        )}

        {/* Farm */}
        <section className="bg-card rounded-xl p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Farm Details</h2>
          <p className="font-medium text-foreground">
            <Link href={`/farms/${listing.farms?.id}`} className="text-primary hover:underline">
              {listing.farms?.farm_name ?? '—'}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {listing.stations?.city ?? listing.farms?.city ?? '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Station: {listing.stations?.station_name ?? '—'}</p>
        </section>

        {/* WhatsApp Bottom */}
        <div className="mb-10">
          <WhatsAppButton listingId={listing.id} breed={listing.cattle?.breed ?? 'livestock'} description={listing.description} />
        </div>

        {/* More from this farm */}
        {moreListing.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">More from {listing.farms?.farm_name}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {moreListing.map(l => (
                <Link key={l.id} href={`/marketplace/${l.id}`} className="bg-card rounded-xl border border-border overflow-hidden sw-card-hover">
                  <div className="h-28 bg-secondary flex items-center justify-center overflow-hidden">
                    {l.photo_url ? (() => {
                      const src = l.photo_url!.startsWith('[') ? JSON.parse(l.photo_url!)[0] : l.photo_url;
                      return <img src={src} alt={l.cattle?.breed} className="w-full h-full object-cover" />;
                    })() : (
                      <span className="text-3xl">🐄</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground">{l.cattle?.breed} · {l.cattle?.current_weight}kg</p>
                    <p className="font-bold text-primary text-sm">{formatPrice(l.asking_price)}</p>
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
