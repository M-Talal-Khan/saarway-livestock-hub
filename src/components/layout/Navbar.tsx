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
  const { isLoggedIn, userName, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-sw-green-700/90 shadow-lg border-b border-white/10'
          : 'bg-sw-green-700'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Image src="/images/logo-icon.png" alt="Saarway" width={36} height={36} className="brightness-0 invert" />
          <span className="text-white">Saarway</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname === link.to
                  ? 'text-white font-semibold underline underline-offset-4'
                  : 'text-white/90'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-3 ml-2">
            {/* Register Your Farm CTA */}
            <Link
              href="/register-farm"
              className="text-sm font-bold px-4 py-2 rounded-lg bg-accent text-foreground shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Register Your Farm
            </Link>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/70">{userName}</span>
                <button onClick={logout} className="text-sm text-white hover:text-destructive flex items-center gap-1 border border-white/30 rounded-lg px-3 py-2 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="text-sm font-medium px-4 py-2 rounded-lg border border-white/50 text-white bg-transparent hover:bg-white/10 transition-colors flex items-center gap-1.5 outline-none">
                  Login <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white rounded-xl shadow-xl border border-border p-1">
                  <DropdownMenuItem
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-foreground hover:bg-secondary"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span>Individual User</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/farm-login')}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-foreground hover:bg-secondary"
                  >
                    <Factory className="w-4 h-4 text-primary" />
                    <span>Farm Owner</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 pb-4 pt-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              href={link.to}
              className={`block py-2.5 text-sm font-medium ${pathname === link.to ? 'text-primary font-semibold' : 'text-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
            <Link href="/register-farm" className="text-center text-sm font-bold px-4 py-2.5 rounded-lg bg-accent text-foreground shadow-md">
              Register Your Farm
            </Link>
            {isLoggedIn ? (
              <button onClick={logout} className="text-sm text-destructive py-2">Logout ({userName})</button>
            ) : (
              <>
                <Link href="/login" className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-border text-foreground">
                  <User className="w-4 h-4" /> Individual User Login
                </Link>
                <Link href="/farm-login" className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-border text-foreground">
                  <Factory className="w-4 h-4" /> Farm Owner Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
