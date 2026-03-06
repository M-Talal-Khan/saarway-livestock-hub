import { Link } from 'react-router-dom';
import { Factory, Beef, MapPin, Dna, ArrowRight, Clock, Lock, Milk, UtensilsCrossed } from 'lucide-react';
import { useScrollAnimation, useCountUp } from '@/hooks/useScrollAnimation';
import { farms } from '@/data/farms';

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  const count = useCountUp(value, 1500, isVisible);
  return (
    <div ref={ref} className="sw-glass rounded-xl p-6 text-center sw-card-hover">
      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
      <p className="text-3xl font-bold text-foreground">{count}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
};

const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  return (
    <main>
      {/* Hero */}
      <section className="sw-gradient-hero min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none">
            <circle cx="200" cy="400" r="300" fill="white" opacity="0.05" />
            <circle cx="1200" cy="200" r="200" fill="white" opacity="0.08" />
            <circle cx="800" cy="600" r="250" fill="white" opacity="0.04" />
          </svg>
        </div>
        <div className="container mx-auto px-4 pt-20 pb-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight sw-fade-in-up">
              Pakistan's First Livestock ERP & Marketplace
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 sw-fade-in-up" style={{ animationDelay: '200ms' }}>
              Manage your entire farm operation digitally — track cattle, monitor health, handle finances, and list animals for sale. All in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center sw-fade-in-up" style={{ animationDelay: '400ms' }}>
              <Link
                to="/marketplace"
                className="px-8 py-3 rounded-xl font-semibold bg-card text-primary hover:bg-secondary transition-all duration-300 sw-btn-glow"
              >
                Browse Marketplace
              </Link>
              <Link
                to="/register-farm"
                className="px-8 py-3 rounded-xl font-semibold bg-accent text-accent-foreground hover:opacity-90 transition-all duration-300"
              >
                Register Your Farm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatCard icon={Factory} label="Farms Onboarded" value={12} />
            <StatCard icon={Beef} label="Animals Listed" value={340} />
            <StatCard icon={MapPin} label="Cities Covered" value={8} />
            <StatCard icon={Dna} label="Breeds Available" value={15} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: 'Register Your Farm', desc: 'Sign up and get your unique Farm ID within 48 hours' },
              { step: 2, title: 'List Your Animals', desc: 'Add cattle with photos, details, and asking price' },
              { step: 3, title: 'Connect with Buyers', desc: 'Buyers contact you directly via WhatsApp' },
            ].map((item, i) => (
              <AnimatedSection key={item.step} delay={i * 150}>
                <div className="bg-card rounded-xl p-6 text-center border border-border sw-card-hover relative">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Origin Story Teaser */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <AnimatedSection>
            <p className="text-lg text-foreground italic mb-6">
              "Saarway began as a semester project with a simple question — what if a farmer in Kasur could list his cattle and a buyer in Lahore could find him in seconds?"
            </p>
            <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Read Our Story <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Farms */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Farms on Saarway</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {farms.slice(0, 4).map((farm, i) => (
              <AnimatedSection key={farm.id} delay={i * 100}>
                <Link to={`/farms/${farm.id}`} className="block bg-card rounded-xl p-6 border border-border sw-card-hover">
                  <h3 className="font-semibold text-foreground text-lg mb-1">{farm.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" /> {farm.city}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{farm.description}</p>
                  <span className="inline-block text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                    {farm.listings} listings
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/farms" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              View All Farms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Modules */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">Coming Soon</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Milk, title: 'Dairy Module', desc: 'Daily milk production tracking, per-cow reports, dairy income integration' },
              { icon: UtensilsCrossed, title: 'Butchery Module', desc: 'Meat processing, packaging, cuts management, direct meat sales' },
            ].map((mod, i) => (
              <AnimatedSection key={mod.title} delay={i * 150}>
                <div className="bg-card rounded-xl p-6 border border-border opacity-70 relative overflow-hidden">
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    <Lock className="w-3 h-3" /> Coming Soon
                  </div>
                  <mod.icon className="w-10 h-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
