"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const inputClass = "w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login('User', 'buyer');
    router.push('/marketplace');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Account created!', description: 'Please check your email to verify your account before accessing the marketplace.' });
  };

  const handleForgot = () => {
    toast({ title: 'Password reset', description: 'Password reset link sent to your email.' });
  };

  return (
    <main className="pt-20 pb-16 sw-mesh-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-sw-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-sw-blob" style={{ animationDelay: '-5s' }} />

      <div className="w-full max-w-md mx-4 relative z-10">
        <div
          className="sw-glass-premium rounded-[2rem] p-8 md:p-10 shadow-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)'
          }}
        >
          {/* Logo & Branding */}
          <div className="text-center mb-6">
            <Image src="/images/logo-icon-v2.png" alt="Saarway" width={56} height={56} className="mx-auto mb-3 drop-shadow-sm" />
            <h1 className="text-2xl font-bold text-foreground">Welcome to Saarway</h1>
            <p className="text-sm text-muted-foreground mt-1">Pakistan&apos;s First Livestock ERP &amp; Marketplace</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all sw-ripple ${tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-secondary-dark'
                  }`}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                <input type="email" required className={`${inputClass} pl-12`} placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-bold text-sw-green-900 mb-2 block">Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                    <Lock className="w-4 h-4 text-primary sw-icon-premium" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} required className={`${inputClass} pl-12`} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={handleForgot} className="text-xs text-primary hover:underline">Forgot your password?</button>
              <button type="submit" className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-sw-green-700 transition-all sw-btn-glow sw-ripple shadow-lg border border-primary/20">
                Login
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account? <button type="button" onClick={() => setTab('signup')} className="text-primary font-medium hover:underline">Sign Up</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                  <User className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                <input type="text" required className={`${inputClass} pl-12`} placeholder="Your full name" />
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-primary sw-icon-premium" />
                </div>
                <input type="email" required className={`${inputClass} pl-12`} placeholder="your@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                    <Phone className="w-4 h-4 text-primary sw-icon-premium" />
                  </div>
                  <input type="tel" className={`${inputClass} pl-12`} placeholder="+92..." />
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                    <MapPin className="w-4 h-4 text-primary sw-icon-premium" />
                  </div>
                  <input type="text" className={`${inputClass} pl-12`} placeholder="Lahore" />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-sw-green-900 mb-2 block">Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                    <Lock className="w-4 h-4 text-primary sw-icon-premium" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} className={`${inputClass} pl-12`} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-sw-green-900 mb-2 block">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 group-focus-within:bg-primary/10 transition-colors">
                    <Lock className="w-4 h-4 text-primary sw-icon-premium" />
                  </div>
                  <input type={showConfirm ? 'text' : 'password'} required minLength={8} className={`${inputClass} pl-12`} placeholder="Confirm password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-sw-green-700 transition-all sw-btn-glow sw-ripple shadow-lg border border-primary/20">
                Create Account
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <button type="button" onClick={() => setTab('login')} className="text-primary font-medium hover:underline">Login</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default Login;
