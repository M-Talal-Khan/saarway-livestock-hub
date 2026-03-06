import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/farms', label: 'Farms' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoggedIn, userName, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isHeroPage = location.pathname === '/' || location.pathname === '/about' || location.pathname === '/register-farm';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHeroPage
          ? 'sw-glass shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Leaf className={`w-7 h-7 ${scrolled || !isHeroPage ? 'text-primary' : 'text-primary-foreground'}`} />
          <span className={scrolled || !isHeroPage ? 'text-foreground' : 'text-primary-foreground'}>
            Saarway
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to
                  ? 'text-primary font-semibold'
                  : scrolled || !isHeroPage
                  ? 'text-foreground'
                  : 'text-primary-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className={`text-sm ${scrolled || !isHeroPage ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>{userName}</span>
              <button onClick={logout} className="text-sm text-destructive hover:underline flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-sw-green-700 transition-colors sw-btn-glow">
                Login
              </Link>
              <Link to="/farm-login" className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                scrolled || !isHeroPage ? 'border-primary text-primary hover:bg-secondary' : 'border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10'
              }`}>
                Farm Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? (
            <X className={`w-6 h-6 ${scrolled || !isHeroPage ? 'text-foreground' : 'text-primary-foreground'}`} />
          ) : (
            <Menu className={`w-6 h-6 ${scrolled || !isHeroPage ? 'text-foreground' : 'text-primary-foreground'}`} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden sw-glass-card border-t border-border px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block py-2 text-sm font-medium ${location.pathname === link.to ? 'text-primary' : 'text-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border">
            {isLoggedIn ? (
              <button onClick={logout} className="text-sm text-destructive">Logout ({userName})</button>
            ) : (
              <>
                <Link to="/login" className="text-center text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground">Login</Link>
                <Link to="/farm-login" className="text-center text-sm font-medium px-4 py-2 rounded-lg border border-primary text-primary">Farm Login</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
