import { useState } from 'react';
import { sales } from '@/data/erp/sales';
import { cattle } from '@/data/erp/cattle';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Info } from 'lucide-react';
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Selling</h1>
        <Button onClick={() => { setAddOpen(true); setSaleMode(null); }} className="gap-1"><Plus className="h-4 w-4" /> Add Sale</Button>
      </div>

      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="p-3 flex gap-2 items-start text-xs text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          Sale auto-posts income to Finance. If the animal was listed on the Marketplace, the listing is automatically removed.
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader><TableRow className="bg-muted/50">
            <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead><TableHead>Buyer</TableHead><TableHead className="text-right">Total</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {sales.map(s => (
              <TableRow key={s.id}>
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
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{!saleMode ? 'Choose Sale Mode' : saleMode === 'single' ? 'Single Animal Sale' : 'Bulk Batch Sale'}</DialogTitle></DialogHeader>

          {!saleMode && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSaleMode('single')}>
                <CardContent className="p-6 text-center">
                  <p className="font-semibold">Single Animal</p>
                  <p className="text-xs text-muted-foreground mt-1">Sell one animal individually</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setSaleMode('bulk')}>
                <CardContent className="p-6 text-center">
                  <p className="font-semibold">Bulk Batch</p>
                  <p className="text-xs text-muted-foreground mt-1">Sell a group as one batch</p>
                </CardContent>
              </Card>
            </div>
          )}

          {saleMode === 'single' && (
            <form onSubmit={handleSingleSale} className="space-y-3">
              <select name="cattleId" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select Animal</option>
                {readyAnimals.map(a => <option key={a.id} value={a.id}>{a.id} — {a.breed} ({a.weight}kg)</option>)}
              </select>
              <select name="saleType" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="Live Sale">Live Sale</option><option value="Slaughter">Slaughter</option>
              </select>
              <Input name="buyer" placeholder="Buyer Name + Phone" required />
              <Input name="price" type="number" placeholder="Sale Price (PKR)" required />
              <Input name="date" type="date" required />
              <Button type="submit" className="w-full">Record Sale</Button>
            </form>
          )}

          {saleMode === 'bulk' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select animals with status "Ready for Sale":</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {readyAnimals.map(a => (
                  <label key={a.id} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                    <input type="checkbox" className="rounded" />
                    <span className="font-mono text-xs">{a.id}</span>
                    <span>{a.breed} · {a.weight}kg</span>
                  </label>
                ))}
              </div>
              <Input placeholder="Total Batch Price (PKR)" type="number" />
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-2 text-[10px] text-amber-800">
                  Override one animal's price → remaining auto-adjust proportionally → total stays the same.
                </CardContent>
              </Card>
              <Button onClick={() => { toast({ title: 'Bulk Sale Recorded' }); setAddOpen(false); setSaleMode(null); }} className="w-full">Record Bulk Sale</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Selling;
