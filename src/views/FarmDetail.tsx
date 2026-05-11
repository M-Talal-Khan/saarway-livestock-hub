"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Beef, Factory, ArrowRight, Loader2 } from 'lucide-react';
import { parsePhotoUrls } from '@/lib/imageUtils';
import { TrustScoreBadge, TrustScorePanel } from '@/components/marketplace/TrustScore';
import type { MarketplaceTrustScore } from '@/lib/marketplace-trust';

interface FarmDetail {
  id: string;
  farm_name: string;
  city: string;
  trust_score?: MarketplaceTrustScore;
}

interface Station {
  id: string;
  station_name: string;
  city: string;
}

interface FarmListing {
  id: string;
  asking_price: number;
  photo_url: string | null;
  listed_at: string;
  cattle: { breed: string; current_weight: number; gender: string; teeth: number } | null;
}

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const FarmDetail = () => {
  const { id } = useParams();
  const [farm, setFarm] = useState<FarmDetail | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [listings, setListings] = useState<FarmListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/farms/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setFarm(d.farm);
        setStations(d.stations ?? []);
        setListings(d.listings ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (notFound || !farm) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Farm not found</h1>
          <Link href="/farms" className="text-primary mt-4 inline-block">← Back to Farms</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/farms" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">← All Farms</Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">{farm.farm_name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="w-4 h-4" /> {farm.city}
          </p>
          <TrustScoreBadge trustScore={farm.trust_score} />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="inline-flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
            <Factory className="w-4 h-4" /> {stations.length} Station{stations.length !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
            <Beef className="w-4 h-4" /> {listings.length} Active Listing{listings.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mb-10">
          <TrustScorePanel trustScore={farm.trust_score} />
        </div>

        {/* Stations */}
        {stations.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">Stations</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map(station => (
                <div key={station.id} className="bg-card rounded-xl p-5 border border-border sw-card-hover">
                  <h3 className="font-semibold text-foreground mb-1">{station.station_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {station.city}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Listings */}
        {listings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-6">Active Listings</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(l => {
                const photos = parsePhotoUrls(l.photo_url);
                const firstPhoto = photos.length > 0 ? photos[0] : null;
                return (
                  <Link key={l.id} href={`/marketplace/${l.id}`} className="bg-card rounded-xl border border-border overflow-hidden sw-card-hover">
                    <div className="h-28 bg-secondary flex items-center justify-center">
                      {firstPhoto ? (
                        <img src={firstPhoto} alt={l.cattle?.breed} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">🐄</span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-foreground">{l.cattle?.breed} · {l.cattle?.current_weight}kg · {l.cattle?.gender}</p>
                      <p className="font-bold text-primary text-sm">{formatPrice(l.asking_price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-4 text-center">
          <Link href="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
            Browse All Listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default FarmDetail;
