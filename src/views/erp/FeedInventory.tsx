"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Wheat, Plus, Package, ClipboardList, Edit, Trash2, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Station {
  id: string;
  station_name: string;
  station_tag: string;
}

interface FeedItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  station_id: string;
  stations: { station_name: string; station_tag: string } | null;
}

interface FeedLog {
  id: string;
  log_type: 'stock_in' | 'consumption';
  quantity: number;
  cost: number | null;
  notes: string | null;
  logged_at: string;
  station_id: string;
  feed_item_id: string;
  feed_items: { name: string; unit: string } | null;
  farm_users: { full_name: string } | null;
  stations: { station_name: string; station_tag: string } | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStockLevel = (current: number, threshold: number): 'green' | 'amber' | 'red' => {
  if (current <= threshold) return 'red';
  if (current <= threshold * 2) return 'amber';
  return 'green';
};

const progressColor = (level: 'green' | 'amber' | 'red') => {
  if (level === 'red') return 'bg-destructive';
  if (level === 'amber') return 'bg-amber-500';
  return 'bg-primary';
};

// ── Main Component ────────────────────────────────────────────────────────────

const FeedInventory = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const isWorker = role === 'Worker';
  const canManage = ['Admin', 'Manager'].includes(role);
  const isStationLocked = ['Manager', 'Worker', 'Veterinarian'].includes(role);

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLogs, setFeedLogs] = useState<FeedLog[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  // Feed Item modal
  const [feedModal, setFeedModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedItem | null>(null);
  const [feedForm, setFeedForm] = useState({ stationId: '', name: '', unit: 'kg', lowStockThreshold: '100', initialStock: '0', isActive: true });
  const [feedSaving, setFeedSaving] = useState(false);

  // Add Stock modal
  const [stockModal, setStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({ feedItemId: '', stationId: '', quantity: '', cost: '', notes: '' });
  const [stockSaving, setStockSaving] = useState(false);

  // Log Consumption modal
  const [consumeModal, setConsumeModal] = useState(false);
  const [consumeForm, setConsumeForm] = useState({ feedItemId: '', stationId: '', quantity: '', cost: '', notes: '' });
  const [consumeSaving, setConsumeSaving] = useState(false);

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState<{ type: 'feed'; id: string } | null>(null);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [feedRes, logsRes, stationsRes] = await Promise.all([
        fetch('/api/erp/feed', { headers }),
        fetch('/api/erp/feed/logs', { headers }),
        fetch('/api/farm-auth/stations', { headers }),
      ]);
      const [feedData, logsData, stationsData] = await Promise.all([feedRes.json(), logsRes.json(), stationsRes.json()]);
      setFeedItems(feedData.feedItems ?? []);
      setFeedLogs(logsData.logs ?? []);
      setStations(stationsData.stations ?? []);
    } catch {
      toast.error('Failed to load feed data');
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (token) fetchAll(); }, [token, fetchAll]);

  // ── Derived data ──────────────────────────────────────────────────────────────

  const activeFeedItems = useMemo(() => feedItems.filter(f => f.is_active), [feedItems]);

  const feedByStation = useMemo(() => {
    const map = new Map<string, { stationName: string; items: FeedItem[] }>();
    feedItems.forEach(fi => {
      const sid = fi.station_id;
      if (!map.has(sid)) map.set(sid, { stationName: fi.stations?.station_name ?? sid, items: [] });
      map.get(sid)!.items.push(fi);
    });
    return map;
  }, [feedItems]);

  // Station filter — admin sees current station (or all if none selected), others locked via API
  const activeStationId = currentStation?.id ?? null;

  const filteredFeedByStation = useMemo(() => {
    if (!activeStationId) return feedByStation;
    const entry = feedByStation.get(activeStationId);
    if (!entry) return new Map();
    return new Map([[activeStationId, entry]]);
  }, [feedByStation, activeStationId]);

  const stockInLogs = useMemo(() =>
    feedLogs.filter(l => l.log_type === 'stock_in' && (!activeStationId || l.station_id === activeStationId)),
    [feedLogs, activeStationId]);
  const consumeLogs = useMemo(() =>
    feedLogs.filter(l => l.log_type === 'consumption' && (!activeStationId || l.station_id === activeStationId)),
    [feedLogs, activeStationId]);

  // ── Feed Item CRUD ─────────────────────────────────────────────────────────────

  const openAddFeed = () => {
    setEditingFeed(null);
    setFeedForm({ stationId: currentStation?.id ?? stations[0]?.id ?? '', name: '', unit: 'kg', lowStockThreshold: '100', initialStock: '0', isActive: true });
    setFeedModal(true);
  };
  const openEditFeed = (f: FeedItem) => {
    setEditingFeed(f);
    setFeedForm({ stationId: f.station_id, name: f.name, unit: f.unit, lowStockThreshold: String(f.low_stock_threshold), initialStock: '0', isActive: f.is_active });
    setFeedModal(true);
  };

  const saveFeed = async () => {
    if (!feedForm.name || !feedForm.unit) { toast.error('Please fill all required fields'); return; }
    setFeedSaving(true);
    try {
      if (editingFeed) {
        const res = await fetch(`/api/erp/feed/${editingFeed.id}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: feedForm.name, unit: feedForm.unit, lowStockThreshold: Number(feedForm.lowStockThreshold), isActive: feedForm.isActive }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        const { feedItem } = await res.json();
        setFeedItems(prev => prev.map(f => f.id === editingFeed.id ? { ...f, ...feedItem } : f));
        toast.success('Feed item updated');
      } else {
        if (!feedForm.stationId) { toast.error('Please select a station'); return; }
        const res = await fetch('/api/erp/feed', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ stationId: feedForm.stationId, name: feedForm.name, unit: feedForm.unit, lowStockThreshold: Number(feedForm.lowStockThreshold), initialStock: Number(feedForm.initialStock) || 0 }),
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        const { feedItem } = await res.json();
        const stationObj = stations.find(s => s.id === feedForm.stationId);
        setFeedItems(prev => [...prev, { ...feedItem, stations: stationObj ? { station_name: stationObj.station_name, station_tag: stationObj.station_tag } : null }]);
        toast.success('Feed item added');
      }
      setFeedModal(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally { setFeedSaving(false); }
  };

  const handleDeleteFeed = async () => {
    if (!deleteModal) return;
    setDeleteConfirming(true);
    try {
      const res = await fetch(`/api/erp/feed/${deleteModal.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setFeedItems(prev => prev.filter(f => f.id !== deleteModal.id));
      toast.success('Feed item deleted');
      setDeleteModal(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally { setDeleteConfirming(false); }
  };

  // ── Stock In ───────────────────────────────────────────────────────────────────

  const openStockModal = () => {
    setStockForm({ feedItemId: '', stationId: isStationLocked ? (currentStation?.id ?? '') : '', quantity: '', cost: '', notes: '' });
    setStockModal(true);
  };

  const saveStock = async () => {
    if (!stockForm.feedItemId || !stockForm.stationId || !stockForm.quantity) { toast.error('Please fill all required fields'); return; }
    setStockSaving(true);
    try {
      const res = await fetch('/api/erp/feed/logs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedItemId: stockForm.feedItemId, stationId: stockForm.stationId, logType: 'stock_in', quantity: Number(stockForm.quantity), cost: stockForm.cost ? Number(stockForm.cost) : null, notes: stockForm.notes || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Stock added. Finance updated automatically.');
      setStockModal(false);
      await fetchAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add stock');
    } finally { setStockSaving(false); }
  };

  // ── Consumption ────────────────────────────────────────────────────────────────

  const openConsumeModal = () => {
    setConsumeForm({ feedItemId: '', stationId: isStationLocked ? (currentStation?.id ?? '') : '', quantity: '', cost: '', notes: '' });
    setConsumeModal(true);
  };

  const saveConsumption = async () => {
    if (!consumeForm.feedItemId || !consumeForm.stationId || !consumeForm.quantity) { toast.error('Please fill all required fields'); return; }
    setConsumeSaving(true);
    try {
      const res = await fetch('/api/erp/feed/logs', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedItemId: consumeForm.feedItemId, stationId: consumeForm.stationId, logType: 'consumption', quantity: Number(consumeForm.quantity), cost: consumeForm.cost ? Number(consumeForm.cost) : null, notes: consumeForm.notes || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast.success('Consumption logged. Finance updated automatically.');
      setConsumeModal(false);
      await fetchAll();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to log consumption');
    } finally { setConsumeSaving(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 erp-slide-up">
            <Wheat className="h-6 w-6 text-primary" />
            Feed & Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage feed items, stock levels, and daily consumption per station</p>
        </div>
      </div>

      <Tabs defaultValue={isWorker ? 'consumption' : 'feed-items'} className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          {!isWorker && <TabsTrigger value="feed-items" className="gap-1.5"><Wheat className="h-4 w-4" />Feed Items</TabsTrigger>}
          {!isWorker && <TabsTrigger value="stock" className="gap-1.5"><Package className="h-4 w-4" />Stock Management</TabsTrigger>}
          <TabsTrigger value="consumption" className="gap-1.5"><ClipboardList className="h-4 w-4" />Consumption Log</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Feed Items ─────────────────────────────────────────────────── */}
        {!isWorker && (
          <TabsContent value="feed-items" className="space-y-4">
            {canManage && (
              <div className="flex justify-end">
                <Button onClick={openAddFeed} className="gap-1.5"><Plus className="h-4 w-4" />Add Feed Item</Button>
              </div>
            )}
            <Card className="p-0 erp-glass-card-subtle erp-stagger-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Low Stock Threshold</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedItems.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No feed items found.</TableCell></TableRow>
                  ) : (
                    feedItems.map(f => {
                      const level = getStockLevel(f.current_stock, f.low_stock_threshold);
                      return (
                        <TableRow key={f.id} className="erp-table-row">
                          <TableCell className="font-medium">{f.name}</TableCell>
                          <TableCell>{f.unit}</TableCell>
                          <TableCell className="text-right">
                            <span className={level === 'red' ? 'text-destructive font-semibold' : level === 'amber' ? 'text-amber-600 font-semibold' : ''}>
                              {f.current_stock.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">{f.low_stock_threshold.toLocaleString()} {f.unit}</TableCell>
                          <TableCell className="text-xs">{f.stations?.station_name ?? '—'}</TableCell>
                          <TableCell>
                            <Badge variant={f.is_active ? 'default' : 'secondary'} className={f.is_active ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                              {f.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          {canManage && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => openEditFeed(f)}><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => setDeleteModal({ type: 'feed', id: f.id })}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}

        {/* ── TAB 2: Stock Management ───────────────────────────────────────────── */}
        {!isWorker && (
          <TabsContent value="stock" className="space-y-6">
            {canManage && (
              <div className="flex justify-end">
                <Button onClick={openStockModal} className="gap-1.5"><Plus className="h-4 w-4" />Add Stock</Button>
              </div>
            )}

            {[...filteredFeedByStation.entries()].map(([sid, { stationName, items }]) => (
              <div key={sid} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{stationName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map(fi => {
                    const level = getStockLevel(fi.current_stock, fi.low_stock_threshold);
                    const pct = Math.min((fi.current_stock / Math.max(fi.low_stock_threshold * 3, 1)) * 100, 100);
                    return (
                      <Card key={fi.id} className={`border-l-[3px] ${level === 'red' ? 'border-l-destructive' : level === 'amber' ? 'border-l-amber-500' : 'border-l-primary'} erp-glass-card`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${level === 'red' ? 'bg-red-100' : level === 'amber' ? 'bg-amber-100' : 'bg-sw-green-100'}`}>
                                <Wheat className={`h-4 w-4 ${level === 'red' ? 'text-destructive' : level === 'amber' ? 'text-amber-600' : 'text-primary'}`} />
                              </div>
                              <span className="font-medium text-sm">{fi.name}</span>
                            </div>
                            {level === 'red' && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">LOW</Badge>}
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-foreground">{fi.current_stock.toLocaleString()}</span>
                            <span className="text-sm text-muted-foreground ml-1">{fi.unit}</span>
                          </div>
                          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div className={`h-full rounded-full transition-all ${progressColor(level)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">Threshold: {fi.low_stock_threshold.toLocaleString()} {fi.unit}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredFeedByStation.size === 0 && (
              <p className="text-center text-muted-foreground py-10">No feed items found.</p>
            )}

            <Card className="p-0 erp-glass-card-subtle erp-stagger-2">
              <CardHeader className="pb-3"><CardTitle className="text-base">Stock In History</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Feed Item</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost (PKR)</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockInLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No stock-in records yet.</TableCell></TableRow>
                    ) : (
                      stockInLogs.map(l => (
                        <TableRow key={l.id} className="erp-table-row">
                          <TableCell>{new Date(l.logged_at).toLocaleDateString('en-PK')}</TableCell>
                          <TableCell className="font-medium">{l.feed_items?.name ?? '—'}</TableCell>
                          <TableCell>{l.stations?.station_name ?? '—'}</TableCell>
                          <TableCell className="text-right">{l.quantity.toLocaleString()} {l.feed_items?.unit ?? ''}</TableCell>
                          <TableCell className="text-right">{l.cost != null ? l.cost.toLocaleString() : '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{l.notes ?? '—'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── TAB 3: Consumption Log ────────────────────────────────────────────── */}
        <TabsContent value="consumption" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openConsumeModal} className="gap-1.5"><Plus className="h-4 w-4" />Log Consumption</Button>
          </div>
          <Card className="p-0 erp-glass-card-subtle erp-stagger-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Feed Item</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost (PKR)</TableHead>
                  <TableHead>Logged By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumeLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No consumption logs yet.</TableCell></TableRow>
                ) : (
                  consumeLogs.map(l => (
                    <TableRow key={l.id} className="erp-table-row">
                      <TableCell>{new Date(l.logged_at).toLocaleDateString('en-PK')}</TableCell>
                      <TableCell className="font-medium">{l.feed_items?.name ?? '—'}</TableCell>
                      <TableCell>{l.stations?.station_name ?? '—'}</TableCell>
                      <TableCell className="text-right">{l.quantity.toLocaleString()} {l.feed_items?.unit ?? ''}</TableCell>
                      <TableCell className="text-right">{l.cost != null ? l.cost.toLocaleString() : '—'}</TableCell>
                      <TableCell>{l.farm_users?.full_name ?? '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.notes ?? '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── MODALS ──────────────────────────────────────────────────────────────── */}

      {/* Feed Item Modal */}
      <Dialog open={feedModal} onOpenChange={setFeedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFeed ? 'Edit Feed Item' : 'Add Feed Item'}</DialogTitle>
            <DialogDescription>Manage the feed types used on the farm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editingFeed && (
              <div className="space-y-2">
                <Label>Station</Label>
                {isStationLocked ? (
                  <Input value={currentStation?.name ?? ''} disabled />
                ) : (
                  <Select value={feedForm.stationId} onValueChange={v => setFeedForm(p => ({ ...p, stationId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                    <SelectContent>{stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Feed Name</Label>
              <Input value={feedForm.name} onChange={e => setFeedForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Silage" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={feedForm.unit} onValueChange={v => setFeedForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="bag">bag</SelectItem>
                    <SelectItem value="litre">litre</SelectItem>
                    <SelectItem value="ton">ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" min="0" value={feedForm.lowStockThreshold} onChange={e => setFeedForm(p => ({ ...p, lowStockThreshold: e.target.value }))} />
              </div>
            </div>
            {!editingFeed && (
              <div className="space-y-2">
                <Label>Initial Stock (optional)</Label>
                <Input type="number" min="0" value={feedForm.initialStock} onChange={e => setFeedForm(p => ({ ...p, initialStock: e.target.value }))} placeholder="0" />
              </div>
            )}
            {editingFeed && (
              <div className="flex items-center gap-3">
                <Switch checked={feedForm.isActive} onCheckedChange={v => setFeedForm(p => ({ ...p, isActive: v }))} />
                <Label>{feedForm.isActive ? 'Active' : 'Inactive'}</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedModal(false)}>Cancel</Button>
            <Button onClick={saveFeed} disabled={feedSaving}>
              {feedSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingFeed ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stock Modal */}
      <Dialog open={stockModal} onOpenChange={setStockModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>Restock feed items at a station.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Station</Label>
              {isStationLocked ? (
                <Input value={currentStation?.name ?? ''} disabled />
              ) : (
                <Select value={stockForm.stationId} onValueChange={v => setStockForm(p => ({ ...p, stationId: v, feedItemId: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Feed Item</Label>
              <Select value={stockForm.feedItemId} onValueChange={v => setStockForm(p => ({ ...p, feedItemId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select feed" /></SelectTrigger>
                <SelectContent>
                  {activeFeedItems
                    .filter(f => !stockForm.stationId || f.station_id === stockForm.stationId)
                    .map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.unit})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" min="0" value={stockForm.quantity} onChange={e => setStockForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 500" />
              </div>
              <div className="space-y-2">
                <Label>Cost (PKR, optional)</Label>
                <Input type="number" min="0" value={stockForm.cost} onChange={e => setStockForm(p => ({ ...p, cost: e.target.value }))} placeholder="Total cost" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes / Source (optional)</Label>
              <Input value={stockForm.notes} onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Malik Feeds supplier" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              Stock cost auto-posts to Finance as Feed Expense.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockModal(false)}>Cancel</Button>
            <Button onClick={saveStock} disabled={stockSaving}>
              {stockSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Consumption Modal */}
      <Dialog open={consumeModal} onOpenChange={setConsumeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Consumption</DialogTitle>
            <DialogDescription>Record daily feed usage at a station.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Station</Label>
              {isStationLocked ? (
                <Input value={currentStation?.name ?? ''} disabled />
              ) : (
                <Select value={consumeForm.stationId} onValueChange={v => setConsumeForm(p => ({ ...p, stationId: v, feedItemId: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Feed Item</Label>
              <Select value={consumeForm.feedItemId} onValueChange={v => setConsumeForm(p => ({ ...p, feedItemId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select feed" /></SelectTrigger>
                <SelectContent>
                  {activeFeedItems
                    .filter(f => !consumeForm.stationId || f.station_id === consumeForm.stationId)
                    .map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.unit}) — {f.current_stock} available</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity Used</Label>
                <Input type="number" min="0" value={consumeForm.quantity} onChange={e => setConsumeForm(p => ({ ...p, quantity: e.target.value }))} placeholder="e.g. 50" />
              </div>
              <div className="space-y-2">
                <Label>Cost (PKR, optional)</Label>
                <Input type="number" min="0" value={consumeForm.cost} onChange={e => setConsumeForm(p => ({ ...p, cost: e.target.value }))} placeholder="Total cost" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input value={consumeForm.notes} onChange={e => setConsumeForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Morning feeding" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              Insufficient stock will be rejected by the server. Finance auto-updates.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumeModal(false)}>Cancel</Button>
            <Button onClick={saveConsumption} disabled={consumeSaving}>
              {consumeSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Log Consumption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteModal} onOpenChange={() => setDeleteModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" />Confirm Delete</DialogTitle>
            <DialogDescription>This action cannot be undone. Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteFeed} disabled={deleteConfirming}>
              {deleteConfirming ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedInventory;
