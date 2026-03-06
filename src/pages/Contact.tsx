import { useState } from 'react';
import { Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [userType, setUserType] = useState<'farm' | 'general'>('general');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Message sent!', description: "Thank you! Your message has been received. We'll get back to you shortly." });
    setSubmitted(true);
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  return (
    <main className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground">Get in touch with the Saarway team</p>
        </div>

        {submitted ? (
          <div className="sw-glass-card rounded-2xl p-10 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Message Received!</h2>
            <p className="text-muted-foreground">Thank you! We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sw-glass-card rounded-2xl p-8 space-y-5">
            {/* User Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">I Am A</label>
              <div className="flex gap-2">
                {(['farm', 'general'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      userType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {type === 'farm' ? 'Farm Owner' : 'General User'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
              <input type="text" required className={inputClass} placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
              <input type="email" required className={inputClass} placeholder="your@email.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
              <input type="tel" className={inputClass} placeholder="+92 300 1234567" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Message *</label>
              <textarea required rows={4} className={inputClass} placeholder="How can we help?" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default Contact;
