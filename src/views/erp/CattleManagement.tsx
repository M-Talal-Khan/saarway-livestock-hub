"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Pencil, Trash2, Download, Info, X, Loader2, Weight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Station {
  id: string;
  station_name: string;
  station_tag: string;
  city: string;
}

interface CattleRow {
  id: string;
  cattle_code: string;
  breed: string;
  teeth: number;
  coat_color: string | null;
  gender: string;
  status: string;
  initial_weight: number;
  current_weight: number;
  purchase_price: number;
  purchase_date: string;
  station_id: string;
  notes: string | null;
  stations: { station_tag: string; station_name: string; city: string } | null;
}

interface WeightLog {
  id: string;
  weight_kg: number;
  logged_at: string;
}

const BREEDS = ['Sahiwal', 'Friesian', 'Cross', 'Cholistani', 'Nili-Ravi', 'Other'];
const STATUSES_FILTER = ['All', 'active', 'fattening', 'ready_for_sale', 'listed', 'sold', 'slaughtered', 'dead'];
const GENDERS = ['All', 'male', 'female'];
const GENDER_LABEL: Record<string, string> = { male: 'Male', female: 'Female' };

const STATUS_LABEL: Record<string, string> = {
  active: 'Active', fattening: 'Fattening', ready_for_sale: 'Ready for Sale',
  listed: 'Listed', sold: 'Sold', slaughtered: 'Slaughtered', dead: 'Dead',
};

// ── View Animal Modal ─────────────────────────────────────────────────────────

interface ViewModalProps {
  animal: CattleRow;
  token: string;
  canEdit: boolean;
  isAdmin: boolean;
  stations: Station[];
  onClose: () => void;
  onUpdated: (updated: CattleRow) => void;
  onDeleted: (id: string) => void;
}

const ViewModal = ({ animal, token, canEdit, isAdmin, stations, onClose, onUpdated, onDeleted }: ViewModalProps) => {
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [loadingWeights, setLoadingWeights] = useState(true);
  const [newWeight, setNewWeight] = useState('');
  const [addingWeight, setAddingWeight] = useState(false);
  const [liveWeight, setLiveWeight] = useState(animal.current_weight);
  const [editStatus, setEditStatus] = useState(animal.status);
  const [editStationId, setEditStationId] = useState(animal.station_id);
  const [editNotes, setEditNotes] = useState(animal.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetch(`/api/erp/cattle/${animal.id}/weights`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setWeights(d.weights ?? []))
      .finally(() => setLoadingWeights(false));
  }, [animal.id, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/erp/cattle/${animal.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, stationId: editStationId, notes: editNotes }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const stationObj = stations.find(s => s.id === editStationId);
      onUpdated({
        ...animal,
        status: editStatus,
        station_id: editStationId,
        notes: editNotes || null,
        stations: stationObj ? { station_tag: stationObj.station_tag, station_name: stationObj.station_name, city: stationObj.city } : animal.stations,
      });
      toast({ title: 'Updated', description: 'Cattle record updated.' });
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Update failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/erp/cattle/${animal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      onDeleted(animal.id);
      toast({ title: 'Deleted', description: `${animal.cattle_code} removed.` });
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Delete failed', variant: 'destructive' });
    } finally { setDeleting(false); }
  };

  const handleAddWeight = async () => {
    if (!newWeight || Number(newWeight) <= 0) return;
    setAddingWeight(true);
    try {
      const res = await fetch(`/api/erp/cattle/${animal.id}/weights`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: Number(newWeight) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const { weight: log } = await res.json();
      setWeights(prev => [...prev, log]);
      setLiveWeight(Number(newWeight));
      onUpdated({ ...animal, current_weight: Number(newWeight) });
      setNewWeight('');
      toast({ title: 'Weight logged', description: `Current weight updated to ${newWeight} kg` });
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setAddingWeight(false); }
  };

  const chartData = weights.map(w => ({
    date: new Date(w.logged_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
    weight: w.weight_kg,
  }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Animal Details — {animal.cattle_code}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Breed', animal.breed],
              ['Teeth', `${animal.teeth} teeth`],
              ['Initial Weight', `${animal.initial_weight} kg`],
              ['Current Weight', `${liveWeight} kg`],
              ['Gender', animal.gender],
              ['Coat Color', animal.coat_color ?? '—'],
              ['Purchase Price', `PKR ${animal.purchase_price.toLocaleString()}`],
              ['Purchase Date', animal.purchase_date],
            ].map(([label, val]) => (
              <div key={String(label)}>
                <span className="text-muted-foreground text-xs">{label}</span>
                <p className="font-medium">{val}</p>
              </div>
            ))}
            <div>
              <span className="text-muted-foreground text-xs">Status</span>
              <div className="mt-0.5"><StatusBadge status={animal.status} /></div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Station</span>
              <p className="font-medium">{animal.stations?.station_name ?? '—'}</p>
            </div>
          </div>

          {/* Edit section (Admin/Manager only, not for terminal-status animals) */}
          {canEdit && ['sold', 'slaughtered', 'dead'].includes(animal.status) && (
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground italic">This animal is {animal.status} — no further actions can be performed.</p>
            </div>
          )}
          {canEdit && !['sold', 'slaughtered', 'dead'].includes(animal.status) && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-semibold">Edit</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABEL).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Station</label>
                  <Select value={editStationId} onValueChange={setEditStationId} disabled={!isAdmin}>
                    <SelectTrigger className={`h-8 text-xs ${!isAdmin ? 'opacity-70' : ''}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stations.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <Input value={editNotes} onChange={e => setEditNotes(e.target.value)} className="h-8 text-xs" placeholder="Optional notes..." />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                </Button>
                {isAdmin && !confirmDelete && (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                )}
                {isAdmin && confirmDelete && (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-destructive">Confirm delete?</span>
                    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, Delete'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Log weight — only for active animals */}
          {!['sold', 'slaughtered', 'dead'].includes(animal.status) && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-1.5"><Weight className="h-4 w-4" /> Log Weight</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  placeholder="Weight in kg"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="h-8 text-xs w-36"
                />
                <Button size="sm" onClick={handleAddWeight} disabled={addingWeight || !newWeight}>
                  {addingWeight ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log'}
                </Button>
              </div>
            </div>
          )}

          {/* Weight chart */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold mb-2">Weight History</p>
            {loadingWeights ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : chartData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No weight logs yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.2)" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} unit=" kg" />
                  <Tooltip formatter={(v: number) => [`${v} kg`, 'Weight']} />
                  <Line type="monotone" dataKey="weight" stroke="hsl(120,50%,48%)" strokeWidth={2} dot={{ r: 3 }} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── Add Cattle Modal ──────────────────────────────────────────────────────────

interface AddModalProps {
  token: string;
  stations: Station[];
  defaultStationId: string | null;
  isAdmin: boolean;
  onAdded: (c: CattleRow) => void;
  onClose: () => void;
}

const AddModal = ({ token, stations, defaultStationId, isAdmin, onAdded, onClose }: AddModalProps) => {
  const [saving, setSaving] = useState(false);
  const [stationId, setStationId] = useState(defaultStationId ?? stations[0]?.id ?? '');
  const [breed, setBreed] = useState(BREEDS[0]);
  const [customBreed, setCustomBreed] = useState('');
  const [teeth, setTeeth] = useState('2');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [coatColor, setCoatColor] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBreed = breed === 'Other' ? customBreed.trim() : breed;
    if (!stationId || !finalBreed || !weight || !gender || !purchaseDate || !purchasePrice) return;
    setSaving(true);
    try {
      const res = await fetch('/api/erp/cattle', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, breed: finalBreed, teeth: Number(teeth), weight: Number(weight), gender, purchasePrice: Number(purchasePrice), purchaseDate, coatColor: coatColor || null, notes: notes || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const { cattle } = await res.json();
      onAdded(cattle);
      toast({ title: 'Cattle added', description: `${cattle.cattle_code} added successfully. Mandatory vaccines assigned.` });
      onClose();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to add', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Cattle</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Station</label>
            <Select value={stationId} onValueChange={setStationId} required disabled={!isAdmin}>
              <SelectTrigger className={!isAdmin ? 'opacity-70' : ''}><SelectValue placeholder="Select station" /></SelectTrigger>
              <SelectContent>{stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Breed</label>
            <Select value={breed} onValueChange={v => { setBreed(v); if (v !== 'Other') setCustomBreed(''); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BREEDS.map(b => <SelectItem key={b} value={b}>{b === 'Other' ? 'Other (custom)' : b}</SelectItem>)}</SelectContent>
            </Select>
            {breed === 'Other' && (
              <Input value={customBreed} onChange={e => setCustomBreed(e.target.value)} placeholder="Enter breed name" required />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Teeth</label>
              <Select value={teeth} onValueChange={setTeeth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[0, 2, 4, 6, 8].map(t => <SelectItem key={t} value={String(t)}>{t} teeth</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Gender</label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 320" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Coat Color</label>
              <Input value={coatColor} onChange={e => setCoatColor(e.target.value)} placeholder="e.g. Brown" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Purchase Date</label>
              <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Purchase Price (PKR)</label>
              <Input type="number" min="0" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="e.g. 250000" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save & Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ── Bulk Actions Bar ──────────────────────────────────────────────────────────

interface BulkActionsBarProps {
  count: number;
  token: string;
  selectedIds: string[];
  stations: Station[];
  onDone: () => void;
}

const BulkActionsBar = ({ count, token, selectedIds, stations, onDone }: BulkActionsBarProps) => {
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkStationId, setBulkStationId] = useState('');
  const [saving, setSaving] = useState(false);

  const applyBulk = async () => {
    if (!bulkStatus && !bulkStationId) {
      toast({ title: 'Select a status or station to apply', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      await Promise.all(selectedIds.map(id =>
        fetch(`/api/erp/cattle/${id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(bulkStatus ? { status: bulkStatus } : {}),
            ...(bulkStationId ? { stationId: bulkStationId } : {}),
          }),
        })
      ));
      toast({ title: 'Bulk update applied', description: `${count} animals updated.` });
      onDone();
    } catch {
      toast({ title: 'Error', description: 'Some updates failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg erp-scale-in backdrop-blur-sm">
      <span className="text-sm font-semibold shrink-0">{count} selected</span>
      <Select value={bulkStatus || 'none'} onValueChange={v => setBulkStatus(v === 'none' ? '' : v)}>
        <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Set status…" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— Set status —</SelectItem>
          {Object.entries(STATUS_LABEL).map(([val, label]) => (
            <SelectItem key={val} value={val}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {stations.length > 1 && (
        <Select value={bulkStationId || 'none'} onValueChange={v => setBulkStationId(v === 'none' ? '' : v)}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Move to station…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Move to station —</SelectItem>
            {stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Button size="sm" className="h-8 text-xs" onClick={applyBulk} disabled={saving}>
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}Apply
      </Button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CattleManagement = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canEdit = ['Admin', 'Manager'].includes(role);
  const isAdmin = role === 'Admin';

  const [cattle, setCattle] = useState<CattleRow[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [stationFilter, setStationFilter] = useState(currentStation?.id ?? 'All');

  // Keep station filter in sync when admin switches station
  useEffect(() => {
    if (currentStation?.id) setStationFilter(currentStation.id);
  }, [currentStation?.id]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewAnimal, setViewAnimal] = useState<CattleRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const fetchCattle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/erp/cattle', { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setCattle(d.cattle ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load cattle', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token]);

  const fetchStations = useCallback(async () => {
    try {
      const res = await fetch('/api/farm-auth/stations', { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setStations(d.stations ?? []);
    } catch { /* silently ignore */ }
  }, [token]);

  useEffect(() => {
    if (token) { fetchCattle(); fetchStations(); }
  }, [token, fetchCattle, fetchStations]);

  // Unique station options for filter
  const stationOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { id: string; label: string }[] = [];
    cattle.forEach(c => {
      if (c.station_id && !seen.has(c.station_id)) {
        seen.add(c.station_id);
        opts.push({ id: c.station_id, label: c.stations?.station_name ?? c.station_id });
      }
    });
    return opts;
  }, [cattle]);

  const filtered = useMemo(() => {
    return cattle.filter(c => {
      if (search && !c.cattle_code.toLowerCase().includes(search.toLowerCase()) && !c.breed.toLowerCase().includes(search.toLowerCase())) return false;
      if (breedFilter !== 'All' && c.breed !== breedFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (genderFilter !== 'All' && c.gender !== genderFilter) return false;
      if (stationFilter !== 'All' && c.station_id !== stationFilter) return false;
      return true;
    });
  }, [cattle, search, breedFilter, statusFilter, genderFilter, stationFilter]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const exportCSV = () => {
    const rows = filtered.map(c =>
      `${c.cattle_code},${c.breed},${c.teeth},${c.current_weight},${c.gender},${STATUS_LABEL[c.status] ?? c.status},${c.stations?.station_name ?? ''},${c.purchase_date},${c.purchase_price}`
    );
    const csv = 'Code,Breed,Teeth,Weight(kg),Gender,Status,Station,PurchaseDate,PurchasePrice(PKR)\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cattle.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `${filtered.length} records exported to CSV` });
  };

  const handleUpdated = (updated: CattleRow) => {
    setCattle(prev => prev.map(c => c.id === updated.id ? updated : c));
  };
  const handleDeleted = (id: string) => {
    setCattle(prev => prev.filter(c => c.id !== id));
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  };
  const handleAdded = (c: CattleRow) => {
    setCattle(prev => [c, ...prev]);
  };

  // Admin's own station_id for default in add form
  const defaultStationId = (!isAdmin && currentStation?.id) ? currentStation.id : stations[0]?.id ?? null;

  const activeFilters = breedFilter !== 'All' || statusFilter !== 'All' || genderFilter !== 'All' || stationFilter !== 'All' || search;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">Cattle Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}><Download className="h-4 w-4" />Export CSV</Button>
          {canEdit && (
            <Button onClick={() => setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Cattle</Button>
          )}
        </div>
      </div>

      <Card className="border-sw-sky-400/30 bg-sw-sky-400/5 erp-glass-card-subtle erp-stagger-1">
        <CardContent className="p-3 flex gap-2 items-start text-xs text-sw-sky-400">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-foreground/70">Every new animal is automatically assigned 5 mandatory vaccinations: FMD (6 months), HS (annual), BQ (annual), LSD (annual), Deworming (3 months).</span>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search code or breed..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-9" />
        </div>
        <Select value={breedFilter} onValueChange={setBreedFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Breed" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Breeds</SelectItem>
            {BREEDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUSES_FILTER.map(s => <SelectItem key={s} value={s}>{s === 'All' ? 'All Statuses' : STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Gender" /></SelectTrigger>
          <SelectContent>
            {GENDERS.map(g => <SelectItem key={g} value={g}>{g === 'All' ? 'All Genders' : GENDER_LABEL[g]}</SelectItem>)}
          </SelectContent>
        </Select>
        {isAdmin && stationOptions.length > 1 && (
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Station" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Stations</SelectItem>
              {stationOptions.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Active filter badges */}
      {activeFilters && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted-foreground mr-1">Filters:</span>
          {search && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setSearch('')}>
              Search: {search}<X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {breedFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setBreedFilter('All')}>
              Breed: {breedFilter}<X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {statusFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setStatusFilter('All')}>
              Status: {STATUS_LABEL[statusFilter]}<X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {genderFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setGenderFilter('All')}>
              Gender: {genderFilter}<X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          {stationFilter !== 'All' && (
            <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setStationFilter('All')}>
              Station: {stationOptions.find(s => s.id === stationFilter)?.label}<X className="h-3 w-3 ml-0.5" />
            </Badge>
          )}
          <button className="text-[11px] text-muted-foreground hover:text-destructive transition-colors ml-1" onClick={() => { setSearch(''); setBreedFilter('All'); setStatusFilter('All'); setGenderFilter('All'); setStationFilter('All'); }}>
            Clear all
          </button>
        </div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && canEdit && (
        <BulkActionsBar
          count={selected.size}
          token={token}
          selectedIds={[...selected]}
          stations={stations}
          onDone={() => { setSelected(new Set()); fetchCattle(); }}
        />
      )}

      {/* Table */}
      <Card className="erp-glass-card-subtle erp-stagger-2">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Teeth</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                      {cattle.length === 0 ? 'No cattle records found.' : 'No results match your filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(c => (
                    <TableRow key={c.id} className="erp-table-row">
                      <TableCell><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></TableCell>
                      <TableCell className="font-mono text-xs">{c.cattle_code}</TableCell>
                      <TableCell>{c.breed}</TableCell>
                      <TableCell>{c.teeth}</TableCell>
                      <TableCell>{c.current_weight} kg</TableCell>
                      <TableCell>{c.gender}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-xs">{c.stations?.station_name ?? '—'}</TableCell>
                      <TableCell className="text-xs">{c.purchase_date}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-sw-sky-400 hover:text-sw-sky-400 hover:bg-sw-sky-400/10"
                          onClick={() => setViewAnimal(c)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View/Edit Modal */}
      {viewAnimal && (
        <ViewModal
          animal={viewAnimal}
          token={token}
          canEdit={canEdit}
          isAdmin={isAdmin}
          stations={stations}
          onClose={() => setViewAnimal(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}

      {/* Add Cattle Modal */}
      {addOpen && canEdit && (
        <AddModal
          token={token}
          stations={stations}
          defaultStationId={defaultStationId}
          isAdmin={isAdmin}
          onAdded={handleAdded}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
};

export default CattleManagement;
