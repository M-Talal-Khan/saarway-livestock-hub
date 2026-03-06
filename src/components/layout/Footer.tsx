"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'linear-gradient(135deg, hsl(120 75% 21%), hsl(120 75% 12%))' }} className="text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <Image src="/images/logo-icon.png" alt="Saarway" width={28} height={28} className="brightness-0 invert" />
              <span>Saarway</span>
            </div>
            <p className="text-white/70 text-sm">Pakistan's First Livestock ERP & Marketplace</p>
            <p className="text-white/50 text-xs mt-2 italic">"Farm. Track. Thrive."</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-sw-green-300 transition-colors">Home</Link>
              <Link href="/about" className="hover:text-sw-green-300 transition-colors">About</Link>
              <Link href="/farms" className="hover:text-sw-green-300 transition-colors">Farms</Link>
              <Link href="/marketplace" className="hover:text-sw-green-300 transition-colors">Marketplace</Link>
            </div>
          </div>

          {/* For Farms */}
          <div>
            <h4 className="font-semibold mb-3">For Farms</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <Link href="/register-farm" className="hover:text-sw-green-300 transition-colors">Register Your Farm</Link>
              <Link href="/farm-login" className="hover:text-sw-green-300 transition-colors">Farm Owner Login</Link>
              <Link href="/contact" className="hover:text-sw-green-300 transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <a href="mailto:info@saarway.com" className="flex items-center gap-2 hover:text-sw-green-300 transition-colors">
                <Mail className="w-4 h-4" /> info@saarway.com
              </a>
              <a href="tel:+923001234567" className="flex items-center gap-2 hover:text-sw-green-300 transition-colors">
                <Phone className="w-4 h-4" /> +92 300 1234567
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Lahore, Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/40">
        <p>© 2025 Saarway. All rights reserved.</p>
        <p className="text-xs mt-1 italic">Farm. Track. Thrive.</p>
      </div>
    </footer>
  );
};

export default Footer;
