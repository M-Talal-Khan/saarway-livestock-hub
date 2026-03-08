"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { MapPin, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Station {
  id: string;
  station_tag: string;
  station_name: string;
  city: string;
}

const StationsOverview = () => {
  const { currentFarm, currentUser, setStation } = useAuth();
  const router = useRouter();
  const token = currentUser?.sessionToken ?? "";

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formTag, setFormTag] = useState("");
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formAddress, setFormAddress] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchStations = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/farm-auth/stations", { headers: authHeaders });
    const data = await res.json();
    if (res.ok) setStations(data.stations);
    else toast({ title: "Error loading stations", description: data.error, variant: "destructive" });
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (currentUser?.role !== "Admin") {
      router.replace("/erp/dashboard");
      return;
    }
    fetchStations();
  }, [currentUser, fetchStations, router]);

  const handleSelect = (s: Station) => {
    setStation({ id: s.id, tag: s.station_tag, name: s.station_name, location: s.city });
    router.push("/erp/dashboard");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/farm-auth/stations", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        stationTag: formTag,
        stationName: formName,
        city: formCity,
        address: formAddress,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast({ title: "Failed to add station", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "Station added", description: `${formName} created successfully` });
    setAddOpen(false);
    setFormTag(""); setFormName(""); setFormCity(""); setFormAddress("");
    fetchStations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading stations...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 erp-slide-up">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Select a Station</h1>
        <p className="text-muted-foreground mt-1">
          {currentFarm?.name} — {stations.length} Station{stations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {stations.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">No stations yet</p>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first station to start managing your farm
          </p>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Station
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stations.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer group erp-glass-card"
                onClick={() => handleSelect(s)}
              >
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-sw-green-700 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(61,184,61,0.4)] transition-all duration-300">
                    <span className="text-primary-foreground font-bold text-xl">{s.station_tag}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-base">{s.station_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {s.city}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Station card */}
            <Card
              className="cursor-pointer group border-2 border-dashed border-border hover:border-primary/50 transition-all"
              onClick={() => setAddOpen(true)}
            >
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300">
                  <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Add Station
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Add Station Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Station</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Station Tag</label>
              <Input
                value={formTag}
                onChange={(e) => setFormTag(e.target.value)}
                placeholder="e.g. A, B, C"
                maxLength={5}
                required
              />
              <p className="text-xs text-muted-foreground">Short identifier shown on the station card</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Station Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Main Station"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">City</label>
              <Input
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="e.g. Lahore"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address (optional)</label>
              <Input
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. Near Main Road, Kasur"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add Station
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StationsOverview;
