"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Wheat, Plus, Package, ClipboardList, Edit, Trash2, AlertTriangle, Info } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  feedItems as initialFeedItems,
  stationStocks as initialStationStocks,
  stockHistory as initialStockHistory,
  consumptionLog as initialConsumptionLog,
  type FeedItem,
  type StationStock,
  type StockEntry,
  type ConsumptionEntry,
} from '@/data/erp/feed';
import { erpStations } from '@/data/erp/erpStations';

const stationNames = erpStations.map(s => s.name);

const FeedInventory = () => {
  const { currentUser, currentStation } = useAuth();
  const role = currentUser?.role || 'Admin';
  const isAdmin = role === 'Admin';
  const isManager = role === 'Manager';
  const isWorker = role === 'Worker';
  const isStationLocked = isManager || isWorker;
  const assignedStation = currentStation?.name || stationNames[0];

  const [feedItemsList, setFeedItemsList] = useState<FeedItem[]>(initialFeedItems);
  const [stationStocksState, setStationStocksState] = useState<Record<string, StationStock[]>>(JSON.parse(JSON.stringify(initialStationStocks)));
  const [stockHistoryState, setStockHistoryState] = useState<StockEntry[]>(initialStockHistory);
  const [consumptionState, setConsumptionState] = useState<ConsumptionEntry[]>(initialConsumptionLog);

  // Feed Item modal
  const [feedModal, setFeedModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedItem | null>(null);
  const [feedForm, setFeedForm] = useState({ name: '', unit: 'kg' as 'kg' | 'bag', costPerUnit: '', threshold: '', status: true });

  // Add Stock modal
  const [stockModal, setStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({ station: '', feedItem: '', quantity: '', date: new Date(), source: '', cost: '' });

  // Log Consumption modal
  const [consumeModal, setConsumeModal] = useState(false);
  const [consumeForm, setConsumeForm] = useState({ station: '', feedItem: '', quantity: '', date: new Date(), loggedBy: '' });

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState<{ type: 'feed' | 'consumption'; id: number } | null>(null);

  // Stock management filters — locked for non-admin; admin defaults to current station
  const [selectedStation, setSelectedStation] = useState<string>(isStationLocked ? assignedStation : (isAdmin && currentStation?.name ? currentStation.name : 'all'));

  // Derived: which stations to show data for
  const effectiveStations = isStationLocked ? [assignedStation] : (selectedStation === 'all' ? stationNames : [selectedStation]);

  // Filter consumption & stock history by station for locked roles
  const filteredConsumption = isStationLocked ? consumptionState.filter(c => c.station === assignedStation) : consumptionState;
  const filteredStockHistory = isStationLocked ? stockHistoryState.filter(e => e.station === assignedStation) : stockHistoryState;

  const openAddFeed = () => {
    setEditingFeed(null);
    setFeedForm({ name: '', unit: 'kg', costPerUnit: '', threshold: '', status: true });
    setFeedModal(true);
  };
  const openEditFeed = (f: FeedItem) => {
    setEditingFeed(f);
    setFeedForm({ name: f.name, unit: f.unit, costPerUnit: String(f.costPerUnit), threshold: String(f.threshold), status: f.status === 'Active' });
    setFeedModal(true);
  };
  const saveFeed = () => {
    if (!feedForm.name || !feedForm.costPerUnit || !feedForm.threshold) { toast.error('Please fill all required fields'); return; }
    const item: FeedItem = {
      id: editingFeed?.id || feedItemsList.length + 1,
      name: feedForm.name,
      unit: feedForm.unit,
      costPerUnit: Number(feedForm.costPerUnit),
      threshold: Number(feedForm.threshold),
      status: feedForm.status ? 'Active' : 'Inactive',
    };
    if (editingFeed) {
      setFeedItemsList(prev => prev.map(f => f.id === editingFeed.id ? item : f));
      toast.success('Feed item updated');
    } else {
      setFeedItemsList(prev => [...prev, item]);
      toast.success('Feed item added');
    }
    setFeedModal(false);
  };

  const deleteFeed = (id: number) => { setDeleteModal({ type: 'feed', id }); };
  const deleteConsumption = (id: number) => { setDeleteModal({ type: 'consumption', id }); };
  const confirmDelete = () => {
    if (!deleteModal) return;
    if (deleteModal.type === 'feed') {
      setFeedItemsList(prev => prev.filter(f => f.id !== deleteModal.id));
      toast.success('Feed item deleted');
    } else {
      setConsumptionState(prev => prev.filter(c => c.id !== deleteModal.id));
      toast.success('Consumption entry deleted');
    }
    setDeleteModal(null);
  };

  // Auto-calculate cost when quantity or feed changes in stock modal
  const getAutoCost = () => {
    const feed = feedItemsList.find(f => f.name === stockForm.feedItem);
    if (feed && stockForm.quantity) return Number(stockForm.quantity) * feed.costPerUnit;
    return 0;
  };

  const saveStock = () => {
    if (!stockForm.station || !stockForm.feedItem || !stockForm.quantity) { toast.error('Please fill all required fields'); return; }
    const qty = Number(stockForm.quantity);
    const cost = stockForm.cost ? Number(stockForm.cost) : getAutoCost();
    const feed = feedItemsList.find(f => f.name === stockForm.feedItem);
    // Add to stock history
    const entry: StockEntry = {
      id: stockHistoryState.length + 1,
      date: format(stockForm.date, 'yyyy-MM-dd'),
      feedItem: stockForm.feedItem,
      station: stockForm.station,
      type: 'Stock In',
      quantity: qty,
      unit: feed?.unit || 'kg',
      cost,
      source: stockForm.source || 'Manual Entry',
    };
    setStockHistoryState(prev => [entry, ...prev]);
    // Update station stock
    setStationStocksState(prev => {
      const updated = { ...prev };
      const stationStock = updated[stockForm.station];
      if (stationStock) {
        const idx = stationStock.findIndex(s => s.feed === stockForm.feedItem);
        if (idx >= 0) {
          stationStock[idx] = { ...stationStock[idx], currentStock: stationStock[idx].currentStock + qty, lastRestocked: format(stockForm.date, 'yyyy-MM-dd') };
        }
      }
      return updated;
    });
    toast.success('Stock added successfully');
    setStockModal(false);
    setStockForm({ station: '', feedItem: '', quantity: '', date: new Date(), source: '', cost: '' });
  };

  const saveConsumption = () => {
    if (!consumeForm.station || !consumeForm.feedItem || !consumeForm.quantity || !consumeForm.loggedBy) { toast.error('Please fill all required fields'); return; }
    const qty = Number(consumeForm.quantity);
    const feed = feedItemsList.find(f => f.name === consumeForm.feedItem);
    // Check available stock
    const stationStock = stationStocksState[consumeForm.station];
    const stockItem = stationStock?.find(s => s.feed === consumeForm.feedItem);
    if (!stockItem || stockItem.currentStock < qty) {
      toast.error('Insufficient stock — cannot consume more than available.');
      return;
    }
    const cost = qty * (feed?.costPerUnit || 0);
    const entry: ConsumptionEntry = {
      id: consumptionState.length + 1,
      date: format(consumeForm.date, 'yyyy-MM-dd'),
      station: consumeForm.station,
      feed: consumeForm.feedItem,
      quantity: qty,
      unit: feed?.unit || 'kg',
      cost,
      loggedBy: consumeForm.loggedBy,
    };
    setConsumptionState(prev => [entry, ...prev]);
    // Deduct from stock
    setStationStocksState(prev => {
      const updated = { ...prev };
      const ss = updated[consumeForm.station];
      if (ss) {
        const idx = ss.findIndex(s => s.feed === consumeForm.feedItem);
        if (idx >= 0) ss[idx] = { ...ss[idx], currentStock: ss[idx].currentStock - qty };
      }
      return updated;
    });
    // Add stock out entry
    setStockHistoryState(prev => [{
      id: prev.length + 1,
      date: format(consumeForm.date, 'yyyy-MM-dd'),
      feedItem: consumeForm.feedItem,
      station: consumeForm.station,
      type: 'Stock Out' as const,
      quantity: qty,
      unit: feed?.unit || 'kg',
      cost,
      source: 'Daily Consumption',
    }, ...prev]);
    toast.success('Consumption logged');
    setConsumeModal(false);
    setConsumeForm({ station: '', feedItem: '', quantity: '', date: new Date(), loggedBy: '' });
  };

  const getStockLevel = (current: number, threshold: number): 'green' | 'amber' | 'red' => {
    if (current <= threshold) return 'red';
    if (current <= threshold * 2) return 'amber';
    return 'green';
  };

  const getProgressColor = (level: 'green' | 'amber' | 'red') => {
    if (level === 'red') return 'bg-destructive';
    if (level === 'amber') return 'bg-amber-500';
    return 'bg-primary';
  };

  const activeFeeds = feedItemsList.filter(f => f.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

        {/* ── TAB 1: Feed Items ── */}
        {!isWorker && (
          <TabsContent value="feed-items" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddFeed} className="gap-1.5"><Plus className="h-4 w-4" />Add Feed Item</Button>
            </div>
            <Card className="p-0 erp-glass-card-subtle erp-stagger-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feed Name</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Cost/Unit (PKR)</TableHead>
                    <TableHead className="text-right">Low Stock Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedItemsList.map(f => (
                    <TableRow key={f.id} className="erp-table-row">
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.unit}</TableCell>
                      <TableCell className="text-right">{f.costPerUnit.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{f.threshold.toLocaleString()} {f.unit}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === 'Active' ? 'default' : 'secondary'} className={f.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-600 hover:text-sky-700 hover:bg-sky-50" onClick={() => openEditFeed(f)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => deleteFeed(f.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}

        {/* ── TAB 2: Stock Management ── */}
        {!isWorker && (
          <TabsContent value="stock" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
             {isAdmin ? (
               <Select value={selectedStation} onValueChange={setSelectedStation}>
                 <SelectTrigger className="w-full sm:w-[280px]"><SelectValue placeholder="Select Station" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Stations</SelectItem>
                   {stationNames.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                 </SelectContent>
               </Select>
             ) : (
               <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                 <Package className="h-4 w-4 text-primary" />
                 {assignedStation}
               </div>
             )}
              <Button onClick={() => { setStockForm({ station: isStationLocked ? assignedStation : '', feedItem: '', quantity: '', date: new Date(), source: '', cost: '' }); setStockModal(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" />Add Stock
              </Button>
            </div>

            {/* Stock Overview Cards */}
            {effectiveStations.map(station => {
              const stocks = stationStocksState[station] || [];
              return (
                <div key={station} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{station}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {stocks.map(s => {
                      const level = getStockLevel(s.currentStock, s.threshold);
                      const pct = Math.min((s.currentStock / (s.threshold * 3)) * 100, 100);
                      return (
                        <Card key={s.feed} className={`border-l-[3px] ${level === 'red' ? 'border-l-destructive' : level === 'amber' ? 'border-l-amber-500' : 'border-l-primary'} erp-glass-card`}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${level === 'red' ? 'bg-red-100' : level === 'amber' ? 'bg-amber-100' : 'bg-sw-green-100'}`}>
                                  <Wheat className={`h-4 w-4 ${level === 'red' ? 'text-destructive' : level === 'amber' ? 'text-amber-600' : 'text-primary'}`} />
                                </div>
                                <span className="font-medium text-sm">{s.feed}</span>
                              </div>
                              {level === 'red' && <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">LOW</Badge>}
                            </div>
                            <div>
                              <span className="text-2xl font-bold text-foreground">{s.currentStock.toLocaleString()}</span>
                              <span className="text-sm text-muted-foreground ml-1">{s.unit}</span>
                            </div>
                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                              <div className={`h-full rounded-full transition-all ${getProgressColor(level)}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">Threshold: {s.threshold.toLocaleString()} {s.unit} · Restocked: {s.lastRestocked}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Stock History Table */}
            <Card className="p-0 erp-glass-card-subtle erp-stagger-2">
              <CardHeader className="pb-3"><CardTitle className="text-base">Stock History</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Feed Item</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost (PKR)</TableHead>
                      <TableHead>Source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStockHistory.map(e => (
                      <TableRow key={e.id} className="erp-table-row">
                        <TableCell>{e.date}</TableCell>
                        <TableCell className="font-medium">{e.feedItem}</TableCell>
                        <TableCell>{e.station}</TableCell>
                        <TableCell>
                          <Badge variant={e.type === 'Stock In' ? 'default' : 'destructive'} className={e.type === 'Stock In' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                            {e.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{e.quantity.toLocaleString()} {e.unit}</TableCell>
                        <TableCell className="text-right">{e.cost.toLocaleString()}</TableCell>
                        <TableCell>{e.source}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── TAB 3: Consumption Log ── */}
        <TabsContent value="consumption" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setConsumeForm({ station: isStationLocked ? assignedStation : '', feedItem: '', quantity: '', date: new Date(), loggedBy: currentUser?.fullName || '' }); setConsumeModal(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" />Log Consumption
            </Button>
          </div>
          <Card className="p-0 erp-glass-card-subtle erp-stagger-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Feed Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost (PKR)</TableHead>
                  <TableHead>Logged By</TableHead>
                  {!isWorker && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsumption.map(c => (
                  <TableRow key={c.id} className="erp-table-row">
                    <TableCell>{c.date}</TableCell>
                    <TableCell>{c.station}</TableCell>
                    <TableCell className="font-medium">{c.feed}</TableCell>
                    <TableCell className="text-right">{c.quantity.toLocaleString()} {c.unit}</TableCell>
                    <TableCell className="text-right">{c.cost.toLocaleString()}</TableCell>
                    <TableCell>{c.loggedBy}</TableCell>
                    {!isWorker && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50" onClick={() => deleteConsumption(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── MODALS ── */}

      {/* Feed Item Modal */}
      <Dialog open={feedModal} onOpenChange={setFeedModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFeed ? 'Edit Feed Item' : 'Add Feed Item'}</DialogTitle>
            <DialogDescription>Manage the feed types used on the farm.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Feed Name</Label>
              <Input value={feedForm.name} onChange={e => setFeedForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Silage" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select value={feedForm.unit} onValueChange={(v: 'kg' | 'bag') => setFeedForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="bag">bag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cost Per Unit (PKR)</Label>
                <Input type="number" value={feedForm.costPerUnit} onChange={e => setFeedForm(p => ({ ...p, costPerUnit: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" value={feedForm.threshold} onChange={e => setFeedForm(p => ({ ...p, threshold: e.target.value }))} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={feedForm.status} onCheckedChange={v => setFeedForm(p => ({ ...p, status: v }))} />
                <Label>{feedForm.status ? 'Active' : 'Inactive'}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedModal(false)}>Cancel</Button>
            <Button onClick={saveFeed}>{editingFeed ? 'Update' : 'Add'}</Button>
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
                <Input value={assignedStation} disabled />
              ) : (
                <Select value={stockForm.station} onValueChange={v => setStockForm(p => ({ ...p, station: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stationNames.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Feed Item</Label>
              <Select value={stockForm.feedItem} onValueChange={v => setStockForm(p => ({ ...p, feedItem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select feed" /></SelectTrigger>
                <SelectContent>{activeFeeds.map(f => <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={stockForm.quantity} onChange={e => setStockForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !stockForm.date && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />{format(stockForm.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={stockForm.date} onSelect={d => d && setStockForm(p => ({ ...p, date: d }))} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Supplier / Source (optional)</Label>
              <Input value={stockForm.source} onChange={e => setStockForm(p => ({ ...p, source: e.target.value }))} placeholder="e.g. Malik Feeds" />
            </div>
            <div className="space-y-2">
              <Label>Cost (PKR)</Label>
              <Input type="number" value={stockForm.cost || getAutoCost() || ''} onChange={e => setStockForm(p => ({ ...p, cost: e.target.value }))} />
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" />Auto-calculated: quantity × cost per unit. Editable.</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              Stock cost auto-posts to Finance as Feed Expense.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockModal(false)}>Cancel</Button>
            <Button onClick={saveStock}>Add Stock</Button>
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
                <Input value={assignedStation} disabled />
              ) : (
                <Select value={consumeForm.station} onValueChange={v => setConsumeForm(p => ({ ...p, station: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>{stationNames.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>Feed Item</Label>
              <Select value={consumeForm.feedItem} onValueChange={v => setConsumeForm(p => ({ ...p, feedItem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select feed" /></SelectTrigger>
                <SelectContent>{activeFeeds.map(f => <SelectItem key={f.id} value={f.name}>{f.name} ({f.unit})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity Used</Label>
                <Input type="number" value={consumeForm.quantity} onChange={e => setConsumeForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !consumeForm.date && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />{format(consumeForm.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={consumeForm.date} onSelect={d => d && setConsumeForm(p => ({ ...p, date: d }))} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Logged By</Label>
              <Input value={consumeForm.loggedBy} onChange={e => setConsumeForm(p => ({ ...p, loggedBy: e.target.value }))} placeholder="Worker/manager name" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              Feed cost auto-posts to Finance as Feed Expense.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumeModal(false)}>Cancel</Button>
            <Button onClick={saveConsumption}>Log Consumption</Button>
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
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedInventory;
