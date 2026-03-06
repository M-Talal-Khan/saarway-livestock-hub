import { useParams, Link } from 'react-router-dom';
import { MapPin, Beef, Factory, ArrowRight } from 'lucide-react';
import { farms } from '@/data/farms';
import { stations } from '@/data/stations';

const FarmDetail = () => {
  const { id } = useParams();
  const farm = farms.find(f => f.id === Number(id));

  if (!farm) {
    return (
      <main className="pt-24 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">Farm not found</h1>
          <Link to="/farms" className="text-primary mt-4 inline-block">← Back to Farms</Link>
        </div>
      </main>
    );
  }

  const farmStations = stations.filter(s => s.farmId === farm.id);
  const totalAnimals = farmStations.reduce((sum, s) => sum + s.animals, 0);

  return (
    <main className="pt-20 pb-16 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/farms" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">← All Farms</Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">{farm.name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="w-4 h-4" /> {farm.city}{farm.address && ` — ${farm.address}`}</p>
          <p className="text-foreground">{farm.description}</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="inline-flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
            <Factory className="w-4 h-4" /> {farmStations.length} Stations
          </span>
          <span className="inline-flex items-center gap-1 text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-full">
            <Beef className="w-4 h-4" /> {totalAnimals} Animals
          </span>
          {farm.farmingType && (
            <span className="inline-flex items-center gap-1 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-full">
              {farm.farmingType}
            </span>
          )}
        </div>

        {/* Stations */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Stations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmStations.map((station, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border border-border sw-card-hover">
                <h3 className="font-semibold text-foreground mb-1">{station.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" /> {station.location}
                </p>
                <p className="text-sm font-medium text-primary">{station.animals} animals</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link to="/marketplace" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-sw-green-700 transition-colors sw-btn-glow">
            View Listings from this Farm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default FarmDetail;
