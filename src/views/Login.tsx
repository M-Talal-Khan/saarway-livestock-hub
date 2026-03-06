"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
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
    <main className="pt-20 pb-16 bg-background min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="sw-glass-card rounded-2xl p-8">
          {/* Logo & Branding */}
          <div className="text-center mb-6">
            <Image src="/images/logo-icon.png" alt="Saarway" width={56} height={56} className="mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground">Welcome to Saarway</h1>
            <p className="text-sm text-muted-foreground mt-1">Pakistan&apos;s First Livestock ERP &amp; Marketplace</p>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
              >
                {t === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" required className={inputClass} placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required className={inputClass} placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="button" onClick={handleForgot} className="text-xs text-primary hover:underline">Forgot your password?</button>
              <button type="submit" className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
                Login
              </button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account? <button type="button" onClick={() => setTab('signup')} className="text-primary font-medium hover:underline">Sign Up</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Full Name</label>
                <input type="text" required className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" required className={inputClass} placeholder="your@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                  <input type="tel" className={inputClass} placeholder="+92..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">City</label>
                  <input type="text" className={inputClass} placeholder="Lahore" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} className={inputClass} placeholder="Min 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} required minLength={8} className={inputClass} placeholder="Confirm password" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
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
