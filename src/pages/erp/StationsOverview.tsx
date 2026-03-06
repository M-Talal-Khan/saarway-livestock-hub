import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { erpStations } from '@/data/erp/erpStations';
import { Card, CardContent } from '@/components/ui/card';

const StationsOverview = () => {
  const { currentFarm, currentUser, setStation } = useAuth();
  const navigate = useNavigate();

  if (currentUser?.role !== 'Admin') {
    return <Navigate to="/erp/dashboard" replace />;
  }

  const handleSelect = (station: typeof erpStations[0]) => {
    setStation({ tag: station.tag, name: station.name, location: station.location });
    navigate('/erp/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Select a Station</h1>
        <p className="text-muted-foreground mt-1">{currentFarm?.name || 'GRASS Farms'} — {erpStations.length} Stations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {erpStations.map(station => (
          <Card
            key={station.tag}
            className="cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all border-border hover:border-primary/50"
            onClick={() => handleSelect(station)}
          >
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">{station.tag}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{station.name}</p>
                <p className="text-sm text-muted-foreground">{station.location}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StationsOverview;
