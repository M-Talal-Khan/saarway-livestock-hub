"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Info, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Station { id: string; station_name: string; station_tag: string; }

interface Purchase {
  id: string;
  supplier_name: string;
  supplier_place: string;
  purchase_date: string;
  animal_count: number;
  transport_cost: number;
  total_amount: number;
  is_finalised: boolean;
  station_id: string;
  stations: { station_name: string } | null;
}

interface AnimalEntry {
  breed: string;
  teeth: number;
  weight: number;
  gender: string;
  price: number;
}

const BREEDS = ['Sahiwal', 'Friesian', 'Cross', 'Cholistani', 'Nili-Ravi', 'Other'];

const Buying = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canAdd = ['Admin', 'Manager'].includes(role);
  const isAdmin = role === 'Admin';

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const [stationFilter, setStationFilter] = useState(currentStation?.id ?? 'All');

  useEffect(() => {
    if (currentStation?.id) setStationFilter(currentStation.id);
  }, [currentStation?.id]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => stationFilter === 'All' || p.station_id === stationFilter);
  }, [purchases, stationFilter]);
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [form1, setForm1] = useState({ stationId: '', supplierName: '', supplierPlace: '', purchaseDate: '', numAnimals: 1, transportCost: 2550 });
  const [animals, setAnimals] = useState<AnimalEntry[]>([]);
  const [animalForm, setAnimalForm] = useState({ breed: BREEDS[0], teeth: '2', weight: '', gender: 'male', price: '' });
  const [customBreed, setCustomBreed] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pr, sr] = await Promise.all([
        fetch('/api/erp/purchases', { headers }),
        fetch('/api/farm-auth/stations', { headers }),
      ]);
      const [pd, sd] = await Promise.all([pr.json(), sr.json()]);
      setPurchases(pd.purchases ?? []);
      setStations(sd.stations ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load purchases', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const openModal = () => {
    setStep(1); setAnimals([]); setCustomBreed('');
    setForm1({ stationId: (!isAdmin && currentStation?.id) ? currentStation.id : stations[0]?.id ?? '', supplierName: '', supplierPlace: '', purchaseDate: '', numAnimals: 1, transportCost: 2550 });
    setAnimalForm({ breed: BREEDS[0], teeth: '2', weight: '', gender: 'male', price: '' });
    setAddOpen(true);
  };

  const addAnimal = () => {
    if (!animalForm.weight || !animalForm.price) { toast({ title: 'Error', description: 'Fill weight and price', variant: 'destructive' }); return; }
    const finalBreed = animalForm.breed === 'Other' ? customBreed.trim() : animalForm.breed;
    if (!finalBreed) { toast({ title: 'Error', description: 'Enter a breed name', variant: 'destructive' }); return; }
    setAnimals(prev => [...prev, { breed: finalBreed, teeth: Number(animalForm.teeth), weight: Number(animalForm.weight), gender: animalForm.gender, price: Number(animalForm.price) }]);
    setAnimalForm(prev => ({ ...prev, weight: '', price: '' }));
  };

  const finalisePurchase = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/erp/purchases', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId: form1.stationId, supplierName: form1.supplierName, supplierPlace: form1.supplierPlace, purchaseDate: form1.purchaseDate, transportCost: form1.transportCost, animals }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const { purchase } = await res.json();
      toast({ title: 'Purchase Finalised', description: `${animals.length} animals added. Total: PKR ${purchase.totalAmount.toLocaleString()}` });
      setAddOpen(false);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">Buying</h1>
        <div className="flex gap-2">
          {isAdmin && stations.length > 1 && (
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Station" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Stations</SelectItem>
                {stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          {canAdd && <Button onClick={openModal} className="gap-1.5 h-9"><Plus className="h-4 w-4" /> Add Purchase</Button>}
        </div>
      </div>

      <Card className="border-sw-sky-400/30 bg-sw-sky-400/5 erp-glass-card-subtle erp-stagger-1">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-sky-400" />
          <span className="text-foreground/70">Each animal appears in Cattle Management with status 'Active'. Total cost auto-posts to Finance as a Purchase Expense.</span>
        </CardContent>
      </Card>

      <Card className="erp-glass-card-subtle erp-stagger-2">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Animals</TableHead>
                  <TableHead className="text-right">Transport</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No purchases yet.</TableCell></TableRow>
                ) : filteredPurchases.map(p => (
                  <TableRow key={p.id} className="erp-table-row">
                    <TableCell className="font-medium">{p.supplier_name}</TableCell>
                    <TableCell>{p.supplier_place}</TableCell>
                    <TableCell>{p.purchase_date}</TableCell>
                    <TableCell>{p.animal_count}</TableCell>
                    <TableCell className="text-right">PKR {p.transport_cost.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">PKR {p.total_amount.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{p.stations?.station_name ?? '—'}</TableCell>
                    <TableCell><StatusBadge status={p.is_finalised ? 'Finalised' : 'Draft'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{step === 1 ? 'Step 1: Purchase Details' : `Step 2: Add Animals (${animals.length}/${form1.numAnimals})`}</DialogTitle>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Station</label>
                <Select value={form1.stationId} onValueChange={v => setForm1(p => ({ ...p, stationId: v }))} disabled={!isAdmin}>
                  <SelectTrigger className={!isAdmin ? 'opacity-70' : ''}><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Supplier Name</label>
                  <Input value={form1.supplierName} onChange={e => setForm1(p => ({ ...p, supplierName: e.target.value }))} placeholder="e.g. Muhammad Akbar" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Place / Mandi</label>
                  <Input value={form1.supplierPlace} onChange={e => setForm1(p => ({ ...p, supplierPlace: e.target.value }))} placeholder="e.g. Lahore Mandi" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Purchase Date</label>
                  <Input type="date" max={new Date().toISOString().split('T')[0]} value={form1.purchaseDate} onChange={e => setForm1(p => ({ ...p, purchaseDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Number of Animals</label>
                  <Input type="number" min={1} value={form1.numAnimals} onChange={e => {
                    const n = Number(e.target.value);
                    setForm1(p => ({ ...p, numAnimals: n, transportCost: n * 2550 }));
                  }} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Transport Cost (PKR) — auto: {form1.numAnimals} × 2,550</label>
                <Input type="number" min="0" value={form1.transportCost} onChange={e => setForm1(p => ({ ...p, transportCost: Number(e.target.value) }))} />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!form1.stationId || !form1.supplierName || !form1.supplierPlace || !form1.purchaseDate) {
                    toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' }); return;
                  }
                  setAnimals([]); setStep(2);
                }}>
                  Save & Add Animals →
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {animals.length < form1.numAnimals && (
                <div className="space-y-3 p-4 bg-sw-green-50 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium">Animal {animals.length + 1} of {form1.numAnimals}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Breed</label>
                      <Select value={animalForm.breed} onValueChange={v => { setAnimalForm(p => ({ ...p, breed: v })); if (v !== 'Other') setCustomBreed(''); }}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{BREEDS.map(b => <SelectItem key={b} value={b}>{b === 'Other' ? 'Other (custom)' : b}</SelectItem>)}</SelectContent>
                      </Select>
                      {animalForm.breed === 'Other' && (
                        <Input className="h-8 mt-1" value={customBreed} onChange={e => setCustomBreed(e.target.value)} placeholder="Enter breed name" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Teeth</label>
                      <Select value={animalForm.teeth} onValueChange={v => setAnimalForm(p => ({ ...p, teeth: v }))}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{[0, 2, 4, 6, 8].map(t => <SelectItem key={t} value={String(t)}>{t} teeth</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Weight (kg)</label>
                      <Input className="h-8" type="number" min="0" value={animalForm.weight} onChange={e => setAnimalForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 320" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Gender</label>
                      <Select value={animalForm.gender} onValueChange={v => setAnimalForm(p => ({ ...p, gender: v }))}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Purchase Price (PKR)</label>
                    <Input className="h-8" type="number" min="0" value={animalForm.price} onChange={e => setAnimalForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 250000" />
                  </div>
                  <Button variant="secondary" className="w-full" onClick={addAnimal}>+ Add Animal</Button>
                </div>
              )}

              {animals.length > 0 && (
                <div className="text-xs space-y-1.5">
                  {animals.map((a, i) => (
                    <div key={i} className="flex justify-between p-3 bg-card rounded-lg border border-border">
                      <span>{a.breed} · {a.teeth}T · {a.weight}kg · {a.gender}</span>
                      <span className="font-medium">PKR {a.price.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between p-3 bg-muted/50 rounded-lg border text-muted-foreground">
                    <span>Transport</span><span>PKR {form1.transportCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-primary/5 rounded-lg border border-primary/20 font-bold">
                    <span>Grand Total</span>
                    <span>PKR {(animals.reduce((s, a) => s + a.price, 0) + form1.transportCost).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {animals.length === form1.numAnimals && (
                <Button onClick={finalisePurchase} className="w-full" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Finalise Purchase
                </Button>
              )}
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStep(1)} disabled={saving}>← Back</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Buying;
