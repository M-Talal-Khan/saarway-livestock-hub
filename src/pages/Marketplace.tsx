import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, LogIn } from 'lucide-react';
import { listings } from '@/data/listings';
import { farms } from '@/data/farms';
import { useAuth } from '@/context/AuthContext';

const breeds = ['Sahiwal', 'Friesian', 'Cross', 'Cholistani', 'Nili-Ravi'];
const teethOptions = [2, 4, 6, 8];
const locations = ['Kasur', 'Lahore', 'Faisalabad', 'Multan', 'Quetta', 'Hyderabad', 'Abbottabad'];
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low → High' },
  { value: 'price-high', label: 'Price: High → Low' },
  { value: 'weight', label: 'Weight' },
];

const formatPrice = (price: number) => `PKR ${price.toLocaleString()}`;

const Marketplace = () => {
  const { isLoggedIn, loginAsGuest } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [breed, setBreed] = useState('');
  const [teeth, setTeeth] = useState('');
  const [location, setLocation] = useState('');
  const [farm, setFarm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const filtered = useMemo(() => {
    let result = [...listings];
    if (breed) result = result.filter(l => l.breed === breed);
    if (teeth) result = result.filter(l => l.teeth === Number(teeth));
    if (location) result = result.filter(l => l.location === location);
    if (farm) result = result.filter(l => l.farm === farm);
    if (minPrice) result = result.filter(l => l.price >= Number(minPrice));
    if (maxPrice) result = result.filter(l => l.price <= Number(maxPrice));

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'weight': result.sort((a, b) => b.weight - a.weight); break;
      default: result.sort((a, b) => a.daysListed - b.daysListed);
    }
    return result;
  }, [breed, teeth, location, farm, sortBy, minPrice, maxPrice]);

  if (!isLoggedIn) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen flex items-center justify-center">
        <div className="sw-glass-card rounded-2xl p-10 text-center max-w-md mx-4">
          <LogIn className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Marketplace Access</h1>
          <p className="text-muted-foreground mb-6">Please log in to browse the livestock marketplace</p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
              Login / Sign Up
            </Link>
            <button onClick={loginAsGuest} className="px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors">
              Continue as Guest (Demo)
            </button>
          </div>
        </div>
      </main>
    );
  }

  const selectClass = "w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Livestock Marketplace</h1>
            <p className="text-muted-foreground">{filtered.length} listings found</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="bg-card rounded-xl p-5 border border-border space-y-4 sticky top-20">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Breed</label>
                <select value={breed} onChange={e => setBreed(e.target.value)} className={selectClass}>
                  <option value="">All Breeds</option>
                  {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Teeth</label>
                <select value={teeth} onChange={e => setTeeth(e.target.value)} className={selectClass}>
                  <option value="">All</option>
                  {teethOptions.map(t => <option key={t} value={t}>{t} teeth</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                <select value={location} onChange={e => setLocation(e.target.value)} className={selectClass}>
                  <option value="">All Locations</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Farm</label>
                <select value={farm} onChange={e => setFarm(e.target.value)} className={selectClass}>
                  <option value="">All Farms</option>
                  {farms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="PKR" className={selectClass} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="PKR" className={selectClass} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass}>
                  {sortOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(listing => (
                <Link key={listing.id} to={`/marketplace/${listing.id}`} className="bg-card rounded-xl border border-border overflow-hidden sw-card-hover">
                  <div className="h-40 bg-secondary flex items-center justify-center">
                    <span className="text-4xl">🐄</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{listing.breed}</span>
                      <span className="text-xs text-muted-foreground">{listing.teeth} teeth</span>
                    </div>
                    <p className="text-lg font-bold text-primary mb-1">{formatPrice(listing.price)}</p>
                    <p className="text-sm text-muted-foreground">{listing.weight} kg • {listing.gender}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <MapPin className="w-3 h-3" /> {listing.farm}, {listing.location}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">No listings match your filters.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Marketplace;
