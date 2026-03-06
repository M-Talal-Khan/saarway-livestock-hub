import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="sw-gradient-hero-dark text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-xl mb-3">
              <Leaf className="w-6 h-6" />
              <span>Saarway</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">Pakistan's First Livestock ERP & Marketplace</p>
            <p className="text-primary-foreground/50 text-xs mt-2 italic">"Farm. Track. Thrive."</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
              <Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link>
              <Link to="/farms" className="hover:text-primary-foreground transition-colors">Farms</Link>
              <Link to="/marketplace" className="hover:text-primary-foreground transition-colors">Marketplace</Link>
            </div>
          </div>

          {/* For Farms */}
          <div>
            <h4 className="font-semibold mb-3">For Farms</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <Link to="/register-farm" className="hover:text-primary-foreground transition-colors">Register Your Farm</Link>
              <Link to="/farm-login" className="hover:text-primary-foreground transition-colors">Farm Owner Login</Link>
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact Us</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
              <a href="mailto:info@saarway.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="w-4 h-4" /> info@saarway.com
              </a>
              <a href="tel:+923001234567" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone className="w-4 h-4" /> +92 300 1234567
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Lahore, Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-sm text-primary-foreground/50">
        <p>© 2025 Saarway. All rights reserved.</p>
        <p className="text-xs mt-1 italic">Farm. Track. Thrive.</p>
      </div>
    </footer>
  );
};

export default Footer;
