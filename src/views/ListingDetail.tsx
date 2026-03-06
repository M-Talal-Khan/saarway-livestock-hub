"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, ArrowLeft } from 'lucide-react';
import { listings } from '@/data/listings';

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const WhatsAppButton = ({ listingId, breed }: { listingId: number; breed: string }) => (
  <a
    href={`https://wa.me/923001234567?text=Hi, I'm interested in your ${breed} listed on Saarway (ID: ${listingId})`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow"
    aria-label="Contact farm via WhatsApp"
  >
    <Phone className="w-5 h-5" /> Contact Farm via WhatsApp
  </a>
);

const ListingDetail = () => {
  const { id } = useParams();
  const listing = listings.find(l => l.id === Number(id));
  const moreListing = listing ? listings.filter(l => l.farmId === listing.farmId && l.id !== listing.id).slice(0, 3) : [];

  if (!listing) {
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

        {/* Photo */}
        <div className="h-64 md:h-96 bg-secondary rounded-xl flex items-center justify-center mb-6">
          <span className="text-7xl">🐄</span>
        </div>

        {/* Price */}
        <h1 className="text-3xl font-bold text-primary mb-4">{formatPrice(listing.price)}</h1>

        {/* WhatsApp Top */}
        <div className="mb-8">
          <WhatsAppButton listingId={listing.id} breed={listing.breed} />
        </div>

        {/* Details Grid */}
        <section className="bg-card rounded-xl p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Animal Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Breed', value: listing.breed },
              { label: 'Teeth', value: listing.teeth.toString() },
              { label: 'Weight', value: `${listing.weight} kg` },
              { label: 'Gender', value: listing.gender },
              { label: 'Status', value: listing.status },
              { label: 'Listing ID', value: `#${listing.id}` },
              { label: 'Days Listed', value: `${listing.daysListed} days` },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Description</h2>
          <p className="text-muted-foreground">{listing.description}</p>
        </section>

        {/* Farm */}
        <section className="bg-card rounded-xl p-6 border border-border mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Farm Details</h2>
          <p className="font-medium text-foreground">
            <Link href={`/farms/${listing.farmId}`} className="text-primary hover:underline">{listing.farm}</Link>
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.location}</p>
        </section>

        {/* WhatsApp Bottom */}
        <div className="mb-10">
          <WhatsAppButton listingId={listing.id} breed={listing.breed} />
        </div>

        {/* More from this farm */}
        {moreListing.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">More from {listing.farm}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {moreListing.map(l => (
                <Link key={l.id} href={`/marketplace/${l.id}`} className="bg-card rounded-xl border border-border overflow-hidden sw-card-hover">
                  <div className="h-28 bg-secondary flex items-center justify-center">
                    <span className="text-3xl">🐄</span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground">{l.breed} • {l.weight}kg</p>
                    <p className="font-bold text-primary text-sm">{formatPrice(l.price)}</p>
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

export default ListingDetail;
