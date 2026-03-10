"use client";

import { useState } from 'react';
import { Mail, Phone, Send, CheckCircle, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Contact = () => {
  const [userType, setUserType] = useState<'Farm Owner' | 'General User'>('General User');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_type: userType, name, email, phone: phone || null, message }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Message sent!', description: "Thank you! Your message has been received. We'll get back to you shortly." });
      setSubmitted(true);
    } catch {
      toast({ title: 'Error', description: 'Could not send your message. Please try again.', variant: 'destructive' });
    } finally { setSending(false); }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  return (
    <main className="pt-20 pb-16 sw-mesh-gradient min-h-screen relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-sw-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-sw-blob" style={{ animationDelay: '-5s' }} />

      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-sw-green-950 mb-2">Contact Us</h1>
          <p className="text-sw-green-950/70 font-medium">Get in touch with the Saarway team</p>
        </div>

        {submitted ? (
          <div
            className="sw-glass-premium rounded-[2rem] p-12 text-center shadow-3xl"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)'
            }}
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-10 h-10 text-primary sw-icon-premium" />
            </div>
            <h2 className="text-2xl font-extrabold text-sw-green-950 mb-3">Message Received!</h2>
            <p className="text-sw-green-950/70 font-medium">Thank you! We'll get back to you shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="sw-glass-premium rounded-[2.5rem] p-10 md:p-14 space-y-7 shadow-3xl text-sw-green-950 border-white/50"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)'
            }}
          >
            {/* User Type */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">I Am A</label>
              <div className="flex gap-2">
                {(['Farm Owner', 'General User'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${userType === type ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Full Name *
              </label>
              <input type="text" required className={inputClass} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Mail className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Email *
              </label>
              <input type="email" required className={inputClass} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Phone className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Phone
              </label>
              <input type="tel" className={inputClass} placeholder="+92 300 1234567" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold text-sw-green-900 mb-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Send className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                Message *
              </label>
              <textarea required rows={4} className={inputClass} placeholder="How can we help?" value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-sw-green-700 transition-all sw-btn-glow sw-ripple shadow-lg disabled:opacity-60"
            >
              <Send className="w-5 h-5 sw-icon-premium" /> {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default Contact;
