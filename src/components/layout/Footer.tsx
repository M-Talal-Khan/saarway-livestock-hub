"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t-4 border-sw-green-500 mt-20 relative overflow-hidden">
      {/* Subtle branding pattern layer */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="footerPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill="currentColor" />
          </pattern>
          <rect width="100" height="100" fill="url(#footerPattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 font-bold text-2xl mb-2">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <Image src="/images/logo-icon-v2.png" alt="Saarway" width={28} height={28} className="brightness-0 invert" />
              </div>
              <span className="text-white tracking-tight text-3xl font-black">Saarway</span>
            </div>
            <p className="text-white/50 text-base leading-relaxed max-w-xs font-medium">
              Pakistan's First Livestock ERP & Marketplace. Enabling digital farm management from end to end.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-sw-green-500/10 rounded-full border border-sw-green-500/20">
              <span className="text-sw-green-400 font-black text-xs uppercase tracking-widest italic leading-none">Farm. Track. Thrive.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-white mb-8 text-sm uppercase tracking-[0.2em] opacity-40">System Map</h4>
            <div className="flex flex-col gap-4 text-base font-bold text-white/50">
              <Link href="/" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">Home</Link>
              <Link href="/about" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">About</Link>
              <Link href="/farms" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">Farms</Link>
              <Link href="/marketplace" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">Marketplace</Link>
            </div>
          </div>

          {/* For Farms */}
          <div>
            <h4 className="font-black text-white mb-8 text-sm uppercase tracking-[0.2em] opacity-40">Operations</h4>
            <div className="flex flex-col gap-4 text-base font-bold text-white/50">
              <Link href="/register-farm" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">Register Your Farm</Link>
              <Link href="/farm-login" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">Farm Owner Login</Link>
              <Link href="/contact" className="hover:text-sw-green-400 transition-all hover:translate-x-1 w-fit">Contact Support</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black text-white mb-8 text-sm uppercase tracking-[0.2em] opacity-40">Direct Contact</h4>
            <div className="flex flex-col gap-5 text-base font-bold text-white/50">
              <a href="mailto:info@saarway.com" className="flex items-center gap-4 hover:text-sw-green-400 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm group-hover:border-sw-green-500/50 group-hover:bg-sw-green-500/10 transition-all">
                  <Mail className="w-5 h-5 text-sw-green-500" />
                </div>
                info@saarway.com
              </a>
              <a href="tel:+923001234567" className="flex items-center gap-4 hover:text-sw-green-400 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm group-hover:border-sw-green-500/50 group-hover:bg-sw-green-500/10 transition-all">
                  <Phone className="w-5 h-5 text-sw-green-500" />
                </div>
                +92 300 1234567
              </a>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-sm">
                  <MapPin className="w-5 h-5 text-sw-green-500" />
                </div>
                Lahore, Pakistan
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 bg-black/40 py-10 text-center text-xs font-black text-white/20 uppercase tracking-[0.3em]">
        <p>© {new Date().getFullYear()} Saarway Digital. High-Performance Livestock Ecosystem.</p>
      </div>
    </footer>
  );
};

export default Footer;
