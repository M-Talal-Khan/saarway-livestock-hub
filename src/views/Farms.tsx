"use client";

import Link from 'next/link';
import { MapPin } from 'lucide-react';
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
    <main className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Registered Farms on Saarway</h1>
          <p className="text-muted-foreground">{farms.length} farms and growing</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {farms.map((farm, i) => (
            <AnimatedSection key={farm.id} delay={i * 80}>
              <Link href={`/farms/${farm.id}`} className="block bg-card rounded-xl p-6 border border-border sw-card-hover h-full">
                <h2 className="font-semibold text-foreground text-lg mb-1">{farm.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="w-3 h-3" /> {farm.city}
                </p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{farm.description}</p>
                <span className="inline-block text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                  {farm.listings} active listings
                </span>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Farms;
