import { useState } from 'react';
import { cattle } from '@/data/erp/cattle';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye, Pencil, Trash2, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const listedAnimals = cattle.filter(c => c.status === 'Listed');
const readyAnimals = cattle.filter(c => c.status === 'Ready for Sale');

const MarketplaceManagement = () => {
  const [createOpen, setCreateOpen] = useState(false);

  const handlePublish = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: 'Listing Published', description: 'Animal is now visible on the public marketplace' });
    setCreateOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Marketplace Management</h1>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Create Listing</Button>
      </div>

      <Card className="border-sw-gold-400/30 bg-sw-gold-400/5">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-gold-400" />
          <span className="text-foreground/70">Platform charges PKR 50 per listing (one-time) + PKR 50 per active animal per month (subscription). Fees are tracked by Super Admin.</span>
        </CardContent>
      </Card>

      {listedAnimals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <p>No active listings. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listedAnimals.map(a => (
            <Card key={a.id} className="overflow-hidden">
              <div className="h-36 bg-sw-green-50 flex items-center justify-center text-muted-foreground text-sm">
                Photo placeholder
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{a.breed}</span>
                  <StatusBadge status="Listed" />
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{a.teeth} teeth · {a.weight} kg · {a.gender}</p>
                  <p>{a.station}</p>
                </div>
                <p className="text-lg font-bold text-primary">PKR {(a.purchasePrice * 1.3).toLocaleString()}</p>
                <div className="flex gap-1.5 pt-1 border-t border-border">
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-sw-sky-400 hover:text-sw-sky-400 hover:bg-sw-sky-400/10"><Eye className="h-3.5 w-3.5" />View</Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"><Pencil className="h-3.5 w-3.5" />Edit</Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" />Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Listing</DialogTitle></DialogHeader>
          <form onSubmit={handlePublish} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Animal (Ready for Sale)</label>
              <Select name="cattleId" required>
                <SelectTrigger><SelectValue placeholder="Choose animal" /></SelectTrigger>
                <SelectContent>{readyAnimals.map(a => <SelectItem key={a.id} value={a.id}>{a.id} — {a.breed} ({a.weight}kg)</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Card className="bg-muted/30">
              <CardContent className="p-3 text-xs text-muted-foreground">
                Auto-filled fields (breed, teeth, weight, station) will be pulled from the cattle record.
              </CardContent>
            </Card>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Asking Price (PKR)</label>
              <Input name="price" type="number" placeholder="e.g. 450000" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description (optional)</label>
              <Textarea name="description" placeholder="Any additional notes for buyers" rows={3} />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Publish Listing</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceManagement;
