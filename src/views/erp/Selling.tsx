"use client";

import { useState } from 'react';
import { sales } from '@/data/erp/sales';
import { cattle } from '@/data/erp/cattle';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Info, User, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Selling = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [saleMode, setSaleMode] = useState<'single' | 'bulk' | null>(null);

  const readyAnimals = cattle.filter(c => c.status === 'Ready for Sale');

  const handleSingleSale = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: 'Sale Recorded', description: 'Income auto-posted to Finance' });
    setAddOpen(false);
    setSaleMode(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">Selling</h1>
        <Button onClick={() => { setAddOpen(true); setSaleMode(null); }} className="gap-1.5"><Plus className="h-4 w-4" /> Add Sale</Button>
      </div>

      <Card className="border-sw-sky-400/30 bg-sw-sky-400/5 erp-glass-card-subtle erp-stagger-1">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-sky-400" />
          <span className="text-foreground/70">Sale auto-posts income to Finance. If the animal was listed on the Marketplace, the listing is automatically removed.</span>
        </CardContent>
      </Card>

      <Card className="erp-glass-card-subtle erp-stagger-2">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead><TableHead>Buyer</TableHead><TableHead className="text-right">Total</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {sales.map(s => (
                <TableRow key={s.id} className="erp-table-row">
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell><StatusBadge status={s.type} /></TableCell>
                  <TableCell>{s.animals}</TableCell>
                  <TableCell className="text-xs">{s.buyer}</TableCell>
                  <TableCell className="text-right font-medium">PKR {s.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{!saleMode ? 'Choose Sale Mode' : saleMode === 'single' ? 'Single Animal Sale' : 'Bulk Batch Sale'}</DialogTitle></DialogHeader>

          {!saleMode && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer group erp-glass-card" onClick={() => setSaleMode('single')}>
                <CardContent className="p-6 text-center space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold">Single Animal</p>
                  <p className="text-xs text-muted-foreground">Sell one animal individually</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer group erp-glass-card" onClick={() => setSaleMode('bulk')}>
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

          {saleMode === 'single' && (
            <form onSubmit={handleSingleSale} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Animal</label>
                <Select name="cattleId" required>
                  <SelectTrigger><SelectValue placeholder="Choose animal" /></SelectTrigger>
                  <SelectContent>{readyAnimals.map(a => <SelectItem key={a.id} value={a.id}>{a.id} — {a.breed} ({a.weight}kg)</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sale Type</label>
                <Select name="saleType" required defaultValue="Live Sale">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Live Sale">Live Sale</SelectItem><SelectItem value="Slaughter">Slaughter</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Buyer Name + Phone</label>
                <Input name="buyer" placeholder="e.g. Ahmed Khan — 0300-1234567" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sale Price (PKR)</label>
                <Input name="price" type="number" placeholder="e.g. 350000" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <Input name="date" type="date" required />
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setSaleMode(null)}>Back</Button>
                <Button type="submit">Record Sale</Button>
              </DialogFooter>
            </form>
          )}

          {saleMode === 'bulk' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select animals with status "Ready for Sale":</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {readyAnimals.map(a => (
                  <label key={a.id} className="flex items-center gap-3 text-sm p-2.5 bg-sw-green-50 rounded-lg cursor-pointer hover:bg-sw-green-100 transition-colors">
                    <input type="checkbox" className="rounded accent-primary h-4 w-4" />
                    <span className="font-mono text-xs">{a.id}</span>
                    <span>{a.breed} · {a.weight}kg</span>
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Total Batch Price (PKR)</label>
                <Input placeholder="e.g. 1200000" type="number" />
              </div>
              <Card className="border-sw-gold-400/30 bg-sw-gold-400/5">
                <CardContent className="p-3 text-[11px] text-foreground/70">
                  Override one animal's price → remaining auto-adjust proportionally → total stays the same.
                </CardContent>
              </Card>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSaleMode(null)}>Back</Button>
                <Button onClick={() => { toast({ title: 'Bulk Sale Recorded' }); setAddOpen(false); setSaleMode(null); }}>Record Bulk Sale</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Selling;
