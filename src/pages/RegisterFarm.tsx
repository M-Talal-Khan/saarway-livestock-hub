import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

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
      <main className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 max-w-2xl py-20">
          <div className="sw-glass-card rounded-2xl p-10 text-center">
            <CheckCircle className="w-20 h-20 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Registration Received!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Thank you! Our team will review and contact you within 24–48 hours with your Farm ID and login credentials.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="sw-gradient-hero pt-28 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-3">Register Your Farm on Saarway</h1>
          <p className="text-primary-foreground/80 text-lg">Get your own Farm ID and start managing your livestock digitally</p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-2xl -mt-6 pb-16">
        <form onSubmit={handleSubmit} className="sw-glass-card rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Farm Name *</label>
            <input type="text" required className={inputClass} placeholder="e.g. Green Valley Farms" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Owner Full Name *</label>
            <input type="text" required className={inputClass} placeholder="Your full name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Phone Number *</label>
              <input type="tel" required className={inputClass} placeholder="+92 300 1234567" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
              <input type="email" required className={inputClass} placeholder="your@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">City / Location *</label>
              <input type="text" required className={inputClass} placeholder="e.g. Lahore" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Number of Stations *</label>
              <input type="number" required min={1} className={inputClass} placeholder="e.g. 2" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Farming Type *</label>
            <div className="flex gap-2">
              {['Meat', 'Dairy', 'Both'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFarmingType(type)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    farmingType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
          <button type="submit" className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
            Submit Registration
          </button>
        </form>
      </div>
    </main>
  );
};

export default RegisterFarm;
