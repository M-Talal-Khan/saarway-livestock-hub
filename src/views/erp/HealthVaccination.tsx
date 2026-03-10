"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Info, Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CattleRef { id: string; cattle_code: string; breed: string; station_id: string; status: string; }

interface Treatment {
  id: string;
  treatment_date: string;
  condition_name: string;
  treatment_given: string;
  medicine: string | null;
  cost: number;
  outcome: string | null;
  cattle: { cattle_code: string } | null;
  farm_users: { full_name: string } | null;
}

interface Vaccination {
  id: string;
  vaccine_name: string;
  status: string;
  administered_date: string | null;
  next_due_date: string | null;
  cattle: { cattle_code: string } | null;
  farm_users: { full_name: string } | null;
}

const HealthVaccination = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canWrite = ['Admin', 'Veterinarian'].includes(role);
  const isAdmin = role === 'Admin';

  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [cattle, setCattle] = useState<CattleRef[]>([]);
  const [loading, setLoading] = useState(true);

  const [addTreatment, setAddTreatment] = useState(false);
  const [tForm, setTForm] = useState({ cattleId: '', treatmentDate: '', conditionName: '', treatmentGiven: '', medicine: '', cost: '', outcome: '' });
  const [tSaving, setTSaving] = useState(false);
  const [tPickerOpen, setTPickerOpen] = useState(false);
  const [tPickerSearch, setTPickerSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const [addVaccination, setAddVaccination] = useState(false);
  const [vForm, setVForm] = useState({ cattleIds: [] as string[], vaccineName: '', administeredDate: today, nextDueDate: '' });
  const [vSaving, setVSaving] = useState(false);
  const [vaccineFilter, setVaccineFilter] = useState('all');
  const [vPickerOpen, setVPickerOpen] = useState(false);
  const [vPickerSearch, setVPickerSearch] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [tRes, vRes, cRes] = await Promise.all([
        fetch('/api/erp/health/treatments', { headers }),
        fetch('/api/erp/health/vaccinations', { headers }),
        fetch('/api/erp/cattle', { headers }),
      ]);
      const [td, vd, cd] = await Promise.all([tRes.json(), vRes.json(), cRes.json()]);
      setTreatments(td.treatments ?? []);
      setVaccinations(vd.vaccinations ?? []);
      setCattle(cd.cattle ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load health records', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  // Filter to vet's station if not admin
  const stationCattle = useMemo(() => {
    if (isAdmin || !currentStation?.id) return cattle;
    return cattle.filter(c => c.station_id === currentStation.id);
  }, [cattle, isAdmin, currentStation?.id]);

  const stationCattleCodes = useMemo(() => new Set(stationCattle.map(c => c.cattle_code)), [stationCattle]);

  const filteredTreatments = useMemo(() => {
    if (isAdmin || !currentStation?.id) return treatments;
    return treatments.filter(t => t.cattle?.cattle_code && stationCattleCodes.has(t.cattle.cattle_code));
  }, [treatments, isAdmin, currentStation?.id, stationCattleCodes]);

  const filteredVaccinations = useMemo(() => {
    if (isAdmin || !currentStation?.id) return vaccinations;
    return vaccinations.filter(v => v.cattle?.cattle_code && stationCattleCodes.has(v.cattle.cattle_code));
  }, [vaccinations, isAdmin, currentStation?.id, stationCattleCodes]);

  const handleAddTreatment = async () => {
    if (!tForm.cattleId || !tForm.treatmentDate || !tForm.conditionName || !tForm.treatmentGiven) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' }); return;
    }
    setTSaving(true);
    try {
      const res = await fetch('/api/erp/health/treatments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cattleId: tForm.cattleId, treatmentDate: tForm.treatmentDate, conditionName: tForm.conditionName, treatmentGiven: tForm.treatmentGiven, medicine: tForm.medicine || null, cost: tForm.cost ? Number(tForm.cost) : 0, outcome: tForm.outcome || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Treatment Added', description: 'Cost auto-posted to Finance as Medical expense.' });
      setAddTreatment(false);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setTSaving(false); }
  };

  const handleAddVaccination = async () => {
    if (vForm.cattleIds.length === 0 || !vForm.vaccineName || !vForm.administeredDate) {
      toast({ title: 'Error', description: 'Select at least one animal and fill required fields', variant: 'destructive' }); return;
    }
    setVSaving(true);
    try {
      const res = await fetch('/api/erp/health/vaccinations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cattleIds: vForm.cattleIds, vaccineName: vForm.vaccineName, administeredDate: vForm.administeredDate, nextDueDate: vForm.nextDueDate || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const result = await res.json();
      toast({ title: 'Vaccinations Recorded', description: `${result.count} animal(s) vaccinated.` });
      setAddVaccination(false);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setVSaving(false); }
  };

  const vacRowClass = (status: string) => {
    if (status === 'overdue') return 'bg-red-50';
    if (status === 'upcoming') return 'bg-amber-50/60';
    return '';
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground erp-slide-up">Health & Vaccination</h1>

      {!canWrite && (
        <Card className="border-sw-sky-400/30 bg-sw-sky-400/5 erp-glass-card-subtle erp-stagger-1">
          <CardContent className="p-3 flex gap-2 items-start text-xs">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-sky-400" />
            <span className="text-foreground/70">Health records are view-only for your role. Contact your Veterinarian or Admin to add records.</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="treatments">
        <TabsList>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="space-y-4">
          {canWrite && (
            <div className="flex justify-end">
              <Button onClick={() => { setTForm({ cattleId: '', treatmentDate: '', conditionName: '', treatmentGiven: '', medicine: '', cost: '', outcome: '' }); setAddTreatment(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Treatment
              </Button>
            </div>
          )}
          <Card className="erp-glass-card-subtle erp-stagger-2">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cattle</TableHead><TableHead>Date</TableHead><TableHead>Condition</TableHead>
                    <TableHead>Treatment</TableHead><TableHead>Medicine</TableHead>
                    <TableHead className="text-right">Cost</TableHead><TableHead>Outcome</TableHead><TableHead>Vet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTreatments.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No treatment records yet.</TableCell></TableRow>
                  ) : filteredTreatments.map(t => (
                    <TableRow key={t.id} className="erp-table-row">
                      <TableCell className="font-mono text-xs">{t.cattle?.cattle_code ?? '—'}</TableCell>
                      <TableCell>{t.treatment_date}</TableCell>
                      <TableCell>{t.condition_name}</TableCell>
                      <TableCell className="text-sm">{t.treatment_given}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.medicine ?? '—'}</TableCell>
                      <TableCell className="text-right">PKR {t.cost.toLocaleString()}</TableCell>
                      <TableCell><StatusBadge status={t.outcome ?? 'ongoing'} /></TableCell>
                      <TableCell className="text-xs">{t.farm_users?.full_name ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Select value={vaccineFilter} onValueChange={setVaccineFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by vaccine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vaccines</SelectItem>
                {Array.from(new Set(filteredVaccinations.map(v => v.vaccine_name))).sort().map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canWrite && (
              <Button onClick={() => { setVForm({ cattleIds: [], vaccineName: '', administeredDate: today, nextDueDate: '' }); setAddVaccination(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Record Vaccination
              </Button>
            )}
          </div>
          <Card className="erp-glass-card-subtle erp-stagger-2">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cattle</TableHead><TableHead>Vaccine</TableHead>
                    <TableHead>Date Given</TableHead><TableHead>Next Due</TableHead>
                    <TableHead>Status</TableHead><TableHead>Administered By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const filtered = vaccineFilter === 'all' ? filteredVaccinations : filteredVaccinations.filter(v => v.vaccine_name === vaccineFilter);
                    if (filtered.length === 0) return (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        {vaccineFilter === 'all' ? 'No vaccination records yet.' : `No records for ${vaccineFilter}.`}
                      </TableCell></TableRow>
                    );
                    return filtered.map(v => (
                      <TableRow key={v.id} className={`erp-table-row ${vacRowClass(v.status)}`}>
                        <TableCell className="font-mono text-xs">{v.cattle?.cattle_code ?? '—'}</TableCell>
                        <TableCell className="font-medium">{v.vaccine_name}</TableCell>
                        <TableCell>{v.administered_date ?? '—'}</TableCell>
                        <TableCell>{v.next_due_date ?? '—'}</TableCell>
                        <TableCell><StatusBadge status={v.status} /></TableCell>
                        <TableCell className="text-xs">{v.farm_users?.full_name ?? '—'}</TableCell>
                      </TableRow>
                    ));
                  })()}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Modal */}
      <Dialog open={addTreatment} onOpenChange={v => { setAddTreatment(v); if (!v) setTPickerOpen(false); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{tPickerOpen ? 'Choose Animal' : 'Add Treatment'}</DialogTitle></DialogHeader>

          {/* Inline picker */}
          {tPickerOpen ? (
            <div className="flex flex-col gap-3" style={{ minHeight: 300 }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search by tag or breed..." value={tPickerSearch} onChange={e => setTPickerSearch(e.target.value)} autoFocus />
              </div>
              <div className="overflow-y-auto max-h-60 space-y-1.5 pr-1">
                {(() => {
                  const filtered = stationCattle.filter(c => !['sold', 'slaughtered', 'dead'].includes(c.status) && (!tPickerSearch || c.cattle_code.toLowerCase().includes(tPickerSearch.toLowerCase()) || c.breed.toLowerCase().includes(tPickerSearch.toLowerCase())));
                  if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8 text-sm">No animals match.</p>;
                  return filtered.map(c => (
                    <button key={c.id} type="button"
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-sw-green-50 ${tForm.cattleId === c.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => { setTForm(p => ({ ...p, cattleId: c.id })); setTPickerOpen(false); }}>
                      <span className="font-mono text-sm font-semibold">{c.cattle_code}</span>
                      <span className="text-muted-foreground text-sm">{c.breed}</span>
                    </button>
                  ));
                })()}
              </div>
              <DialogFooter><Button variant="ghost" onClick={() => setTPickerOpen(false)}>Back</Button></DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Select Animal</label>
                <Button type="button" variant="outline" className="w-full justify-start font-normal"
                  onClick={() => { setTPickerSearch(''); setTPickerOpen(true); }}>
                  {tForm.cattleId
                    ? (() => { const a = stationCattle.find(c => c.id === tForm.cattleId); return a ? `${a.cattle_code} — ${a.breed}` : 'Choose animal'; })()
                    : <span className="text-muted-foreground">Choose animal</span>}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Treatment Date</label>
                  <Input type="date" max={today} value={tForm.treatmentDate} onChange={e => setTForm(p => ({ ...p, treatmentDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Outcome</label>
                  <Select value={tForm.outcome || 'none'} onValueChange={v => setTForm(p => ({ ...p, outcome: v === 'none' ? '' : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select outcome" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Select —</SelectItem>
                      <SelectItem value="recovered">Recovered</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="died">Died</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Condition / Diagnosis</label>
                <Input value={tForm.conditionName} onChange={e => setTForm(p => ({ ...p, conditionName: e.target.value }))} placeholder="e.g. Foot rot" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Treatment Given</label>
                <Input value={tForm.treatmentGiven} onChange={e => setTForm(p => ({ ...p, treatmentGiven: e.target.value }))} placeholder="e.g. Antibiotics course" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Medicine + Dosage</label>
                  <Input value={tForm.medicine} onChange={e => setTForm(p => ({ ...p, medicine: e.target.value }))} placeholder="e.g. Oxytetracycline 20ml" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cost (PKR)</label>
                  <Input type="number" min="0" value={tForm.cost} onChange={e => setTForm(p => ({ ...p, cost: e.target.value }))} placeholder="e.g. 500" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Cost auto-posts to Finance as Medical expense</p>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddTreatment(false)}>Cancel</Button>
                <Button onClick={handleAddTreatment} disabled={tSaving}>
                  {tSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Save Treatment
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Modal — Bulk */}
      <Dialog open={addVaccination} onOpenChange={v => { setAddVaccination(v); if (!v) setVPickerOpen(false); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{vPickerOpen ? 'Select Animals' : 'Record Vaccination'}</DialogTitle></DialogHeader>

          {/* Bulk picker with checkboxes */}
          {vPickerOpen ? (
            <div className="flex flex-col gap-3" style={{ minHeight: 300 }}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-8" placeholder="Search by tag or breed..." value={vPickerSearch} onChange={e => setVPickerSearch(e.target.value)} autoFocus />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span>{vForm.cattleIds.length} selected</span>
                {(() => {
                  const active = stationCattle.filter(c => !['sold', 'slaughtered', 'dead'].includes(c.status));
                  const allSelected = active.length > 0 && active.every(c => vForm.cattleIds.includes(c.id));
                  return (
                    <button type="button" className="text-primary hover:underline" onClick={() => {
                      if (allSelected) {
                        setVForm(p => ({ ...p, cattleIds: [] }));
                      } else {
                        setVForm(p => ({ ...p, cattleIds: active.map(c => c.id) }));
                      }
                    }}>{allSelected ? 'Deselect All' : 'Select All'}</button>
                  );
                })()}
              </div>
              <div className="overflow-y-auto max-h-60 space-y-1.5 pr-1">
                {(() => {
                  const filtered = stationCattle.filter(c => !['sold', 'slaughtered', 'dead'].includes(c.status) && (!vPickerSearch || c.cattle_code.toLowerCase().includes(vPickerSearch.toLowerCase()) || c.breed.toLowerCase().includes(vPickerSearch.toLowerCase())));
                  if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8 text-sm">No animals match.</p>;
                  return filtered.map(c => {
                    const checked = vForm.cattleIds.includes(c.id);
                    return (
                      <label key={c.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-sw-green-50 cursor-pointer ${checked ? 'border-primary bg-primary/5' : 'border-border'}`}>
                        <Checkbox checked={checked} onCheckedChange={() => {
                          setVForm(p => ({
                            ...p,
                            cattleIds: checked ? p.cattleIds.filter(id => id !== c.id) : [...p.cattleIds, c.id],
                          }));
                        }} />
                        <span className="font-mono text-sm font-semibold">{c.cattle_code}</span>
                        <span className="text-muted-foreground text-sm">{c.breed}</span>
                      </label>
                    );
                  });
                })()}
              </div>
              <DialogFooter>
                <Button onClick={() => setVPickerOpen(false)}>Done ({vForm.cattleIds.length} selected)</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Select Animals</label>
                <Button type="button" variant="outline" className="w-full justify-start font-normal"
                  onClick={() => { setVPickerSearch(''); setVPickerOpen(true); }}>
                  {vForm.cattleIds.length > 0
                    ? <span>{vForm.cattleIds.length} animal(s) selected</span>
                    : <span className="text-muted-foreground">Choose animals</span>}
                </Button>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Vaccine</label>
                <Select value={vForm.vaccineName} onValueChange={v => setVForm(p => ({ ...p, vaccineName: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select vaccine" /></SelectTrigger>
                  <SelectContent>{['FMD', 'HS', 'BQ', 'LSD', 'Deworming'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Date Given</label>
                  <Input type="date" max={today} value={vForm.administeredDate} onChange={e => setVForm(p => ({ ...p, administeredDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Next Due</label>
                  <Input type="date" min={today} value={vForm.nextDueDate} onChange={e => setVForm(p => ({ ...p, nextDueDate: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setAddVaccination(false)}>Cancel</Button>
                <Button onClick={handleAddVaccination} disabled={vSaving}>
                  {vSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Vaccinate {vForm.cattleIds.length} Animal(s)
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthVaccination;
