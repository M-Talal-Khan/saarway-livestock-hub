"use client";

import { useState, useMemo } from 'react';
import { cattle as initialCattle, Cattle } from '@/data/erp/cattle';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Eye, Pencil, Trash2, Download, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const breeds = ['All', 'Sahiwal', 'Friesian', 'Cross', 'Cholistani', 'Nili-Ravi'];
const statuses = ['All', 'Active', 'Fattening', 'Ready for Sale', 'Listed', 'Sold', 'Slaughtered', 'Dead'];
const genders = ['All', 'Male', 'Female'];
const stations = ['All', 'Station 1 — Main', 'Station 2 — East Wing', 'Station 3 — Pattoki Road'];

const CattleManagement = () => {
  const [cattleData, setCattleData] = useState<Cattle[]>(initialCattle);
  const [search, setSearch] = useState('');
  const [breedFilter, setBreedFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [stationFilter, setStationFilter] = useState('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewAnimal, setViewAnimal] = useState<Cattle | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return cattleData.filter(c => {
      if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.breed.toLowerCase().includes(search.toLowerCase())) return false;
      if (breedFilter !== 'All' && c.breed !== breedFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (genderFilter !== 'All' && c.gender !== genderFilter) return false;
      if (stationFilter !== 'All' && c.station !== stationFilter) return false;
      return true;
    });
  }, [cattleData, search, breedFilter, statusFilter, genderFilter, stationFilter]);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const exportCSV = () => {
    const rows = filtered.map(c => `${c.id},${c.breed},${c.teeth},${c.weight},${c.gender},${c.status},${c.station},${c.purchaseDate},${c.purchasePrice}`);
    const csv = 'ID,Breed,Teeth,Weight,Gender,Status,Station,PurchaseDate,PurchasePrice\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cattle.csv'; a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: `${filtered.length} records exported to CSV` });
  };

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newId = `F001-${String(cattleData.length + 1).padStart(4, '0')}`;
    const newCattle: Cattle = {
      id: newId,
      breed: fd.get('breed') as string,
      teeth: Number(fd.get('teeth')),
      weight: Number(fd.get('weight')),
      gender: fd.get('gender') as 'Male' | 'Female',
      status: 'Active',
      station: fd.get('station') as string,
      purchaseDate: fd.get('purchaseDate') as string,
      purchasePrice: Number(fd.get('purchasePrice')),
    };
    setCattleData(prev => [...prev, newCattle]);
    setAddOpen(false);
    toast({ title: 'Added', description: `${newId} added successfully` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Cattle Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV}><Download className="h-4 w-4" />Export CSV</Button>
          <Button onClick={() => setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Cattle</Button>
        </div>
      </div>

      <Card className="border-sw-sky-400/30 bg-sw-sky-400/5">
        <CardContent className="p-3 flex gap-2 items-start text-xs text-sw-sky-400">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span className="text-foreground/70">Every new animal is automatically assigned 5 mandatory vaccinations: FMD (6 months), HS (annual), BQ (annual), LSD (annual), Deworming (3 months).</span>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ID or breed..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-48 h-9" />
        </div>
        {[{ label: 'Breed', val: breedFilter, set: setBreedFilter, opts: breeds },
          { label: 'Status', val: statusFilter, set: setStatusFilter, opts: statuses },
          { label: 'Gender', val: genderFilter, set: setGenderFilter, opts: genders },
          { label: 'Station', val: stationFilter, set: setStationFilter, opts: stations }
        ].map(f => (
          <Select key={f.label} value={f.val} onValueChange={f.set}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder={f.label} /></SelectTrigger>
            <SelectContent>{f.opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-sw-green-50 border border-primary/20 rounded-lg text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <Button variant="outline" size="sm" className="h-7 text-xs">Change Status</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">Move Station</Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></TableHead>
                <TableHead>ID</TableHead><TableHead>Breed</TableHead><TableHead>Teeth</TableHead><TableHead>Weight</TableHead><TableHead>Gender</TableHead><TableHead>Status</TableHead><TableHead>Station</TableHead><TableHead>Purchase Date</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell><Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleSelect(c.id)} /></TableCell>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell>{c.breed}</TableCell>
                  <TableCell>{c.teeth}</TableCell>
                  <TableCell>{c.weight} kg</TableCell>
                  <TableCell>{c.gender}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell className="text-xs">{c.station}</TableCell>
                  <TableCell className="text-xs">{c.purchaseDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-sw-sky-400 hover:text-sw-sky-400 hover:bg-sw-sky-400/10" onClick={() => setViewAnimal(c)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Animal Modal */}
      <Dialog open={!!viewAnimal} onOpenChange={() => setViewAnimal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Animal Details — {viewAnimal?.id}</DialogTitle></DialogHeader>
          {viewAnimal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Breed', viewAnimal.breed], ['Teeth', viewAnimal.teeth],
                  ['Weight', `${viewAnimal.weight} kg`], ['Gender', viewAnimal.gender],
                  ['Station', viewAnimal.station], ['Purchase', `PKR ${viewAnimal.purchasePrice.toLocaleString()}`],
                  ['Date', viewAnimal.purchaseDate],
                ].map(([label, val]) => (
                  <div key={String(label)}>
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <p className="font-medium">{val}</p>
                  </div>
                ))}
                <div>
                  <span className="text-muted-foreground text-xs">Status</span>
                  <div className="mt-0.5"><StatusBadge status={viewAnimal.status} /></div>
                </div>
              </div>
              {viewAnimal.weightHistory && (
                <div>
                  <p className="text-sm font-medium mb-2">Weight History</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={viewAnimal.weightHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.2)" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="hsl(120,50%,48%)" strokeWidth={2} animationDuration={800} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Cattle Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Cattle</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Station</label>
              <Select name="station" required defaultValue={stations[1]}>
                <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                <SelectContent>{stations.filter(s => s !== 'All').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Breed</label>
              <Select name="breed" required defaultValue={breeds[1]}>
                <SelectTrigger><SelectValue placeholder="Select breed" /></SelectTrigger>
                <SelectContent>{breeds.filter(b => b !== 'All').map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Teeth</label>
                <Select name="teeth" required defaultValue="2">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[2,4,6,8].map(t => <SelectItem key={t} value={String(t)}>{t} teeth</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Weight (kg)</label>
                <Input name="weight" type="number" placeholder="e.g. 320" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Gender</label>
              <Select name="gender" required defaultValue="Male">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Purchase Date</label>
              <Input name="purchaseDate" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Purchase Price (PKR)</label>
              <Input name="purchasePrice" type="number" placeholder="e.g. 250000" required />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Save & Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CattleManagement;
