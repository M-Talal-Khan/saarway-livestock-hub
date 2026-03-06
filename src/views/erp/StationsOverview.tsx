"use client";

import { useRouter, redirect } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { erpStations } from '@/data/erp/erpStations';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const StationsOverview = () => {
  const { currentFarm, currentUser, setStation } = useAuth();
  const router = useRouter();

  if (currentUser?.role !== 'Admin') {
    redirect('/erp/dashboard');
  }

  const handleSelect = (station: typeof erpStations[0]) => {
    setStation({ tag: station.tag, name: station.name, location: station.location });
    router.push('/erp/dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Select a Station</h1>
        <p className="text-muted-foreground mt-1">{currentFarm?.name || 'GRASS Farms'} — {erpStations.length} Stations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {erpStations.map(station => (
          <Card
            key={station.tag}
            className="cursor-pointer group"
            onClick={() => handleSelect(station)}
          >
            <CardContent className="p-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:bg-sw-green-700 transition-colors">
                <span className="text-primary-foreground font-bold text-xl">{station.tag}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground text-base">{station.name}</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {station.location}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StationsOverview;
