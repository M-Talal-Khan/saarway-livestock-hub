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
import { Plus, Info, Loader2, User, Package, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CattleRow {
  id: string;
  cattle_code: string;
  breed: string;
  current_weight: number;
  status: string;
  station_id: string;
  stations: { station_name: string } | null;
}

interface SaleItem { cattle_id: string; individual_price: number; }

interface Sale {
  id: string;
  sale_type: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  slaughterhouse: string | null;
  total_price: number;
  sale_date: string;
  station_id: string;
  stations: { station_name: string } | null;
  sale_items: SaleItem[];
}

interface Station { id: string; station_name: string; }

// ── Component ─────────────────────────────────────────────────────────────────

const Selling = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canAdd = ['Admin', 'Manager', 'Accounts Officer'].includes(role);
  const isAdmin = role === 'Admin';

  const [sales, setSales] = useState<Sale[]>([]);
  const [cattle, setCattle] = useState<CattleRow[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const [stationFilter, setStationFilter] = useState(currentStation?.id ?? 'All');

  useEffect(() => {
    if (currentStation?.id) setStationFilter(currentStation.id);
  }, [currentStation?.id]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => stationFilter === 'All' || s.station_id === stationFilter);
  }, [sales, stationFilter]);

  const [addOpen, setAddOpen] = useState(false);
  const [saleMode, setSaleMode] = useState<'single' | 'bulk' | null>(null);
  const [saving, setSaving] = useState(false);

  // Single sale form
  const [singleForm, setSingleForm] = useState({ cattleId: '', saleType: 'live', buyerName: '', buyerPhone: '', slaughterhouse: '', meatWeightKg: '', pricePerKg: '', price: '', saleDate: '', notes: '' });

  // Animal picker modal
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerStatus, setPickerStatus] = useState('');

  // Bulk sale form
  const [bulkStationId, setBulkStationId] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  const [bulkPrices, setBulkPrices] = useState<Record<string, string>>({});
  const [bulkTotalPrice, setBulkTotalPrice] = useState('');
  const [bulkBuyer, setBulkBuyer] = useState('');
  const [bulkPhone, setBulkPhone] = useState('');
  const [bulkDate, setBulkDate] = useState('');
  const [bulkSaleType, setBulkSaleType] = useState<'live' | 'slaughter'>('live');
  const [bulkSlaughterhouse, setBulkSlaughterhouse] = useState('');

  // ── Auto-calculations ──────────────────────────────────────────────────────

  // Slaughter: meat × price/kg → auto-fill sale price
  useEffect(() => {
    if (singleForm.saleType !== 'slaughter') return;
    const w = Number(singleForm.meatWeightKg);
    const p = Number(singleForm.pricePerKg);
    if (w > 0 && p > 0) {
      setSingleForm(prev => ({ ...prev, price: String(Math.round(w * p)) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleForm.meatWeightKg, singleForm.pricePerKg, singleForm.saleType]);

  // Bulk: sum individual prices → auto-fill total batch price
  useEffect(() => {
    const ids = [...bulkSelected];
    if (ids.length === 0) return;
    const sum = ids.reduce((s, id) => s + (Number(bulkPrices[id] ?? 0)), 0);
    if (sum > 0) setBulkTotalPrice(String(sum));
  }, [bulkPrices, bulkSelected]);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [sr, cr, stationsRes] = await Promise.all([
        fetch('/api/erp/sales', { headers }),
        fetch('/api/erp/cattle', { headers }),
        fetch('/api/farm-auth/stations', { headers }),
      ]);
      const [sd, cd, std] = await Promise.all([sr.json(), cr.json(), stationsRes.json()]);
      setSales(sd.sales ?? []);
      setCattle(cd.cattle ?? []);
      setStations(std.stations ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchData(); }, [token, fetchData]);

  const today = new Date().toISOString().split('T')[0];

  const readyAnimals = useMemo(() =>
    cattle.filter(c => !['sold', 'slaughtered', 'dead'].includes(c.status)),
    [cattle]
  );

  const bulkAnimals = useMemo(() =>
    readyAnimals.filter(c => !bulkStationId || c.station_id === bulkStationId),
    [readyAnimals, bulkStationId]
  );

  // ── Open modal ─────────────────────────────────────────────────────────────

  const openModal = () => {
    setSaleMode(null); setSaving(false); setPickerOpen(false); setPickerSearch(''); setPickerStatus('');
    setSingleForm({ cattleId: '', saleType: 'live', buyerName: '', buyerPhone: '', slaughterhouse: '', meatWeightKg: '', pricePerKg: '', price: '', saleDate: '', notes: '' });
    setBulkSelected(new Set()); setBulkPrices({}); setBulkTotalPrice(''); setBulkBuyer(''); setBulkPhone(''); setBulkDate(''); setBulkStationId((!isAdmin && currentStation?.id) ? currentStation.id : ''); setBulkSaleType('live'); setBulkSlaughterhouse('');
    setAddOpen(true);
  };

  // ── Single sale submit ─────────────────────────────────────────────────────

  const handleSingleSale = async () => {
    if (!singleForm.cattleId || !singleForm.saleType || !singleForm.price || !singleForm.saleDate) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' }); return;
    }
    const cattle_row = cattle.find(c => c.id === singleForm.cattleId);
    if (!cattle_row) return;

    setSaving(true);
    try {
      const res = await fetch('/api/erp/sales', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: cattle_row.station_id,
          saleType: singleForm.saleType,
          buyerName: singleForm.buyerName || null,
          buyerPhone: singleForm.buyerPhone || null,
          slaughterhouse: singleForm.slaughterhouse || null,
          meatWeightKg: singleForm.meatWeightKg || null,
          pricePerKg: singleForm.pricePerKg || null,
          totalPrice: Number(singleForm.price),
          saleDate: singleForm.saleDate,
          notes: singleForm.notes || null,
          animals: [{ cattleId: singleForm.cattleId, price: Number(singleForm.price) }],
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Sale Recorded', description: 'Income auto-posted to Finance.' });
      setAddOpen(false);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  // ── Bulk sale submit ───────────────────────────────────────────────────────

  const handleBulkSale = async () => {
    const ids = [...bulkSelected];
    if (ids.length === 0 || !bulkDate || !bulkTotalPrice) {
      toast({ title: 'Error', description: 'Select animals, total price, and date', variant: 'destructive' }); return;
    }
    const totalPrice = Number(bulkTotalPrice);

    // Build per-animal prices — distribute evenly if not overridden
    const totalOverride = ids.reduce((s, id) => s + (Number(bulkPrices[id] ?? 0)), 0);
    const unset = ids.filter(id => !bulkPrices[id] || bulkPrices[id] === '');
    const remaining = totalPrice - totalOverride;
    const evenShare = unset.length > 0 ? remaining / unset.length : 0;

    const animals = ids.map(id => ({
      cattleId: id,
      price: bulkPrices[id] ? Number(bulkPrices[id]) : Math.round(evenShare * 100) / 100,
    }));
    const priceSum = animals.reduce((s, a) => s + a.price, 0);
    if (Math.abs(priceSum - totalPrice) > 1) {
      toast({ title: 'Error', description: 'Individual prices do not sum to total. Adjust prices.', variant: 'destructive' }); return;
    }

    const stationId = bulkAnimals.find(c => c.id === ids[0])?.station_id ?? '';

    setSaving(true);
    try {
      const res = await fetch('/api/erp/sales', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId, saleType: bulkSaleType,
          buyerName: bulkSaleType === 'live' ? (bulkBuyer || null) : null,
          buyerPhone: bulkSaleType === 'live' ? (bulkPhone || null) : null,
          slaughterhouse: bulkSaleType === 'slaughter' ? (bulkSlaughterhouse || null) : null,
          totalPrice, saleDate: bulkDate, animals,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Bulk Sale Recorded', description: `${ids.length} animals sold. Income posted.` });
      setAddOpen(false);
      await fetchData();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const toggleBulkSelect = (id: string) => {
    setBulkSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">Selling</h1>
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
          {canAdd && <Button onClick={openModal} className="gap-1.5 h-9"><Plus className="h-4 w-4" /> Add Sale</Button>}
        </div>
      </div>

      <Card className="border-sw-sky-400/30 bg-sw-sky-400/5 erp-glass-card-subtle erp-stagger-1">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-sky-400" />
          <span className="text-foreground/70">Sale auto-posts income to Finance. Animal status changes to Sold or Slaughtered. Marketplace listing is automatically removed.</span>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Animals</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No sales yet.</TableCell></TableRow>
                ) : filteredSales.map(s => (
                  <TableRow key={s.id} className="erp-table-row">
                    <TableCell>{s.sale_date}</TableCell>
                    <TableCell><StatusBadge status={s.sale_type} /></TableCell>
                    <TableCell>{s.sale_items.length}</TableCell>
                    <TableCell className="text-sm">{s.buyer_name ?? s.slaughterhouse ?? '—'}</TableCell>
                    <TableCell className="text-xs">{s.stations?.station_name ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium">PKR {s.total_price.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add Sale Modal ───────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{!saleMode ? 'Choose Sale Mode' : saleMode === 'single' ? 'Single Animal Sale' : 'Bulk Batch Sale'}</DialogTitle>
          </DialogHeader>

          {/* Mode picker */}
          {!saleMode && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer erp-glass-card hover:border-primary/40 transition-colors" onClick={() => setSaleMode('single')}>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold">Single Animal</p>
                  <p className="text-xs text-muted-foreground">Sell one animal individually</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer erp-glass-card hover:border-sw-gold-400/40 transition-colors" onClick={() => setSaleMode('bulk')}>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-sw-gold-400/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-sw-gold-400" />
                  </div>
                  <p className="font-semibold">Bulk Batch</p>
                  <p className="text-xs text-muted-foreground">Sell a group as one batch</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Animal picker view (inline, replaces form) */}
          {saleMode === 'single' && pickerOpen && (
            <div className="flex flex-col gap-3" style={{ minHeight: 340 }}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search by tag or breed..."
                    value={pickerSearch}
                    onChange={e => setPickerSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <Select value={pickerStatus || 'all'} onValueChange={v => setPickerStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-36"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ready_for_sale">Ready for Sale</SelectItem>
                    <SelectItem value="listed">Listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-y-auto max-h-64 space-y-1.5 pr-1">
                {(() => {
                  const filtered = cattle.filter(a => {
                    if (['sold', 'slaughtered', 'dead'].includes(a.status)) return false;
                    const matchSearch = !pickerSearch ||
                      a.cattle_code.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                      a.breed.toLowerCase().includes(pickerSearch.toLowerCase());
                    const matchStatus = !pickerStatus || a.status === pickerStatus;
                    return matchSearch && matchStatus;
                  });
                  if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8 text-sm">No animals match your search.</p>;
                  return filtered.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      className={`w-full text-left flex items-center justify-between gap-3 p-3 rounded-lg border transition-colors hover:bg-sw-green-50 ${singleForm.cattleId === a.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => { setSingleForm(p => ({ ...p, cattleId: a.id })); setPickerOpen(false); }}
                    >
                      <div>
                        <span className="font-mono text-sm font-semibold">{a.cattle_code}</span>
                        <span className="text-muted-foreground text-sm ml-2">{a.breed} · {a.current_weight}kg</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">{a.status.replace(/_/g, ' ')}</Badge>
                    </button>
                  ));
                })()}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setPickerOpen(false)}>Back</Button>
              </DialogFooter>
            </div>
          )}

          {/* Single sale form */}
          {saleMode === 'single' && !pickerOpen && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Select Animal</label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                  onClick={() => { setPickerSearch(''); setPickerStatus(''); setPickerOpen(true); }}
                >
                  {singleForm.cattleId
                    ? (() => { const a = cattle.find(c => c.id === singleForm.cattleId); return a ? `${a.cattle_code} — ${a.breed} (${a.current_weight}kg)` : 'Choose animal'; })()
                    : <span className="text-muted-foreground">Choose animal</span>}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sale Type</label>
                  <Select value={singleForm.saleType} onValueChange={v => setSingleForm(p => ({ ...p, saleType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live Sale</SelectItem>
                      <SelectItem value="slaughter">Slaughter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sale Date</label>
                  <Input type="date" max={today} value={singleForm.saleDate} onChange={e => setSingleForm(p => ({ ...p, saleDate: e.target.value }))} />
                </div>
              </div>
              {singleForm.saleType === 'live' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Buyer Name</label>
                    <Input value={singleForm.buyerName} onChange={e => setSingleForm(p => ({ ...p, buyerName: e.target.value }))} placeholder="Ahmed Khan" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Buyer Phone</label>
                    <Input value={singleForm.buyerPhone} onChange={e => setSingleForm(p => ({ ...p, buyerPhone: e.target.value }))} placeholder="0300-1234567" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Slaughterhouse</label>
                    <Input value={singleForm.slaughterhouse} onChange={e => setSingleForm(p => ({ ...p, slaughterhouse: e.target.value }))} placeholder="Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Meat (kg)</label>
                    <Input type="number" min="0" value={singleForm.meatWeightKg} onChange={e => setSingleForm(p => ({ ...p, meatWeightKg: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Price/kg</label>
                    <Input type="number" min="0" value={singleForm.pricePerKg} onChange={e => setSingleForm(p => ({ ...p, pricePerKg: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-2">
                  Sale Price (PKR)
                  {singleForm.saleType === 'slaughter' && singleForm.meatWeightKg && singleForm.pricePerKg && (
                    <span className="text-[10px] text-primary font-normal">auto-calculated</span>
                  )}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={singleForm.price}
                  onChange={e => setSingleForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="e.g. 350000"
                  readOnly={singleForm.saleType === 'slaughter' && !!(singleForm.meatWeightKg && singleForm.pricePerKg)}
                  className={singleForm.saleType === 'slaughter' && !!(singleForm.meatWeightKg && singleForm.pricePerKg) ? 'bg-muted cursor-default' : ''}
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSaleMode(null)}>Back</Button>
                <Button onClick={handleSingleSale} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Record Sale
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Bulk sale form */}
          {saleMode === 'bulk' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sale Type</label>
                  <Select value={bulkSaleType} onValueChange={v => setBulkSaleType(v as 'live' | 'slaughter')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live Sale</SelectItem>
                      <SelectItem value="slaughter">Slaughter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Filter by Station</label>
                  <Select value={bulkStationId || 'all'} onValueChange={v => { setBulkStationId(v === 'all' ? '' : v); setBulkSelected(new Set()); }} disabled={!isAdmin}>
                    <SelectTrigger className={!isAdmin ? 'opacity-70' : ''}><SelectValue placeholder="All stations" /></SelectTrigger>
                    <SelectContent>
                      {isAdmin && <SelectItem value="all">All stations</SelectItem>}
                      {stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {bulkSaleType === 'slaughter' && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Slaughterhouse</label>
                  <Input value={bulkSlaughterhouse} onChange={e => setBulkSlaughterhouse(e.target.value)} placeholder="Name (optional)" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Select Animals</label>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {bulkAnimals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No animals available.</p>
                  ) : bulkAnimals.map(a => (
                    <label key={a.id} className="flex items-center gap-3 text-sm p-2.5 bg-sw-green-50 rounded-lg cursor-pointer hover:bg-sw-green-100 transition-colors">
                      <input type="checkbox" checked={bulkSelected.has(a.id)} onChange={() => toggleBulkSelect(a.id)} className="rounded accent-primary h-4 w-4" />
                      <span className="font-mono text-xs">{a.cattle_code}</span>
                      <span className="flex-1">{a.breed} · {a.current_weight}kg</span>
                      {bulkSelected.has(a.id) && (
                        <Input
                          type="number"
                          min="0"
                          className="h-7 w-28 text-xs"
                          placeholder="Price (PKR)"
                          value={bulkPrices[a.id] ?? ''}
                          onChange={e => { e.stopPropagation(); setBulkPrices(prev => ({ ...prev, [a.id]: e.target.value })); }}
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Total Batch Price (PKR)
                    {[...bulkSelected].some(id => bulkPrices[id]) && (
                      <span className="text-[10px] text-primary font-normal">auto-summed</span>
                    )}
                  </label>
                  <Input type="number" min="0" value={bulkTotalPrice} onChange={e => setBulkTotalPrice(e.target.value)} placeholder="e.g. 1200000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Sale Date</label>
                  <Input type="date" max={today} value={bulkDate} onChange={e => setBulkDate(e.target.value)} />
                </div>
              </div>
              {bulkSaleType === 'live' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Buyer Name</label>
                    <Input value={bulkBuyer} onChange={e => setBulkBuyer(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Buyer Phone</label>
                    <Input value={bulkPhone} onChange={e => setBulkPhone(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
              )}
              <Card className="border-sw-gold-400/30 bg-sw-gold-400/5">
                <CardContent className="p-3 text-[11px] text-foreground/70">
                  {bulkSelected.size} animal(s) selected. Set individual prices optionally — unset animals split remaining amount evenly.
                </CardContent>
              </Card>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSaleMode(null)}>Back</Button>
                <Button onClick={handleBulkSale} disabled={saving || bulkSelected.size === 0}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Record Bulk Sale
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Selling;
