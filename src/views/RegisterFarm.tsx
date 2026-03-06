"use client";

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle, Building2, User, Phone, Mail, MapPin, Hash, ClipboardList } from 'lucide-react';

const RegisterFarm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [farmingType, setFarmingType] = useState('');

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="min-h-screen sw-mesh-gradient pt-20 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-sw-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-sw-blob" style={{ animationDelay: '-5s' }} />

        <div className="container mx-auto px-4 max-w-2xl py-32 relative z-10">
          <div
            className="sw-glass-premium rounded-[2.5rem] p-12 text-center shadow-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)'
            }}
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="w-12 h-12 text-primary sw-icon-premium" />
            </div>
            <h2 className="text-3xl font-extrabold text-sw-green-950 mb-4">Registration Received!</h2>
            <p className="text-sw-green-950/70 text-lg max-w-md mx-auto font-medium">
              Thank you! Our team will review and contact you within 24–48 hours with your Farm ID and login credentials.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen sw-mesh-gradient relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-sw-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/15 rounded-full blur-3xl animate-sw-blob" style={{ animationDelay: '-2s' }} />

      {/* Hero */}
      <section className="sw-gradient-hero pt-48 pb-64 relative z-10 overflow-hidden">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home_slider/slide2.png"
            alt="Background"
            fill
            className="object-cover blur-3xl opacity-40 scale-110"
          />
          <div className="absolute inset-0 bg-sw-green-950/20" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary-foreground mb-5 drop-shadow-lg tracking-tight">Register Your Farm</h1>
          <p className="text-primary-foreground/90 text-xl md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
            Join Pakistan's leading livestock network and digitize your operations today.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-2xl -mt-44 pb-24 relative z-20">
        <form
          onSubmit={handleSubmit}
          className="sw-glass-premium rounded-[2.5rem] p-10 md:p-14 space-y-8 shadow-3xl text-sw-green-950 border-white/50"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)'
          }}
        >
          <div>
            <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Building2 className="w-4 h-4 text-primary sw-icon-premium" />
              </div>
              Farm Name *
            </label>
            <input type="text" required className={inputClass} placeholder="e.g. Green Valley Farms" />
          </div>
          <div>
            <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="w-4 h-4 text-primary sw-icon-premium" />
              </div>
              Owner Full Name *
            </label>
            <input type="text" required className={inputClass} placeholder="Your full name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Phone className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Phone Number *
              </label>
              <input type="tel" required className={inputClass} placeholder="+92 300 1234567" />
            </div>
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Mail className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Email *
              </label>
              <input type="email" required className={inputClass} placeholder="your@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <MapPin className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                City / Location *
              </label>
              <input type="text" required className={inputClass} placeholder="e.g. Lahore" />
            </div>
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Hash className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Number of Stations *
              </label>
              <input type="number" required min={1} className={inputClass} placeholder="e.g. 2" />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-sw-green-900 mb-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <ClipboardList className="w-4 h-4 text-primary sw-icon-premium" />
              </div>
              Farming Type *
            </label>
            <div className="flex gap-2">
              {['Meat', 'Dairy', 'Both'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFarmingType(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${farmingType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Brief Farm Description</label>
            <textarea rows={3} className={inputClass} placeholder="Tell us about your farm..." />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-sw-green-700 transition-all sw-btn-glow sw-ripple flex items-center justify-center gap-3 group"
          >
            <CheckCircle className="w-5 h-5 sw-icon-premium group-hover:scale-110 transition-transform" />
            Complete Registration
          </button>
        </form>
      </div>
    </main>
  );
};

export default RegisterFarm;
