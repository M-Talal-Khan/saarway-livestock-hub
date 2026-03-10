"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, LogOut, ChevronDown, User, Factory } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/farms', label: 'Farms' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/contact', label: 'Contact Us' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn, buyerUser, currentUser, buyerSignOut, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Display name: buyer uses Supabase metadata, farm user uses fullName from session
  const displayName =
    currentUser?.fullName ??
    buyerUser?.user_metadata?.full_name ??
    buyerUser?.email ??
    null;

  const handleLogout = async () => {
    if (buyerUser) {
      await buyerSignOut();
    } else {
      logout();
    }
    router.push('/');
  };

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'backdrop-blur-xl bg-white/95 shadow-sm border-b border-border'
        : 'bg-white'
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image src="/images/logo-icon-v2.png" alt="Saarway" width={36} height={36} />
          <span className="text-sw-green-950 font-extrabold tracking-tight">Saarway</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`text-sm font-medium transition-colors hover:text-sw-green-600 ${pathname === link.to
                ? 'text-sw-green-700 font-bold underline underline-offset-4'
                : 'text-sw-green-950/80'
                }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-3 ml-2">
            {/* Register Your Farm CTA */}
            <Link
              href="/register-farm"
              className="text-sm font-bold px-4 py-2 rounded-lg bg-[#16a34a] text-white shadow-md hover:bg-[#15803d] hover:shadow-lg hover:scale-[1.02] transition-all sw-ripple"
            >
              Register Your Farm
            </Link>

            {!mounted ? (
              <div className="w-[88px] h-[38px] opacity-0"></div>
            ) : isLoggedIn ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border">
                <span className="text-sm font-medium text-sw-green-950/70">{displayName}</span>
                <button onClick={handleLogout} className="text-sm text-sw-green-900 border border-border bg-sw-green-50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 flex items-center gap-1 rounded-lg px-3 py-2 transition-all">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium px-4 py-2 rounded-lg border border-border text-sw-green-950 bg-white hover:bg-sw-green-50 transition-all flex items-center gap-1.5 outline-none sw-ripple">
                  Login <ChevronDown className="w-4 h-4 sw-icon-premium" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white rounded-xl shadow-xl border border-border p-1 mt-1">
                  <DropdownMenuItem
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-foreground hover:bg-sw-green-50"
                  >
                    <User className="w-4 h-4 text-sw-green-600" />
                    <span className="font-medium text-sw-green-950">Individual User</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/farm-login')}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-foreground hover:bg-sw-green-50"
                  >
                    <Factory className="w-4 h-4 text-sw-green-600" />
                    <span className="font-medium text-sw-green-950">Farm / Staff Login</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6 text-sw-green-950" /> : <Menu className="w-6 h-6 text-sw-green-950" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 pb-6 pt-2 shadow-xl absolute w-full mt-[1px]">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`block py-3 text-sm font-medium border-b border-border/40 ${pathname === link.to ? 'text-sw-green-600 font-bold' : 'text-sw-green-950/80'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-5">
            <Link href="/register-farm" className="text-center text-sm font-bold px-4 py-3 rounded-xl bg-[#16a34a] text-white shadow-md sw-ripple">
              Register Your Farm
            </Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-sm font-medium text-destructive py-3 border border-destructive/20 rounded-xl bg-destructive/5 hover:bg-destructive/10">
                Logout ({displayName})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link href="/login" className="flex flex-col items-center justify-center gap-2 text-xs font-semibold px-2 py-4 rounded-xl border border-border text-sw-green-900 bg-sw-green-50 hover:bg-sw-green-100">
                  <User className="w-5 h-5 text-sw-green-600" /> User Login
                </Link>
                <Link href="/farm-login" className="flex flex-col items-center justify-center gap-2 text-xs font-semibold px-2 py-4 rounded-xl border border-border text-sw-green-900 bg-sw-green-50 hover:bg-sw-green-100">
                  <Factory className="w-5 h-5 text-sw-green-600" /> Farm / Staff
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
