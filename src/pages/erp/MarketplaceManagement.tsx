import { useState } from 'react';
import { cattle } from '@/data/erp/cattle';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Marketplace Management</h1>
        <Button onClick={() => setCreateOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Create Listing</Button>
      </div>

      <Card className="mb-4 border-amber-200 bg-amber-50">
        <CardContent className="p-3 flex gap-2 items-start text-xs text-amber-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          Platform charges PKR 50 per listing (one-time) + PKR 50 per active animal per month (subscription). Fees are tracked by Super Admin.
        </CardContent>
      </Card>

      {listedAnimals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No active listings. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listedAnimals.map(a => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <div className="h-32 bg-muted rounded-t-lg flex items-center justify-center text-muted-foreground text-sm">Photo placeholder</div>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{a.breed}</span>
                  <StatusBadge status="Listed" />
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>{a.teeth} teeth · {a.weight} kg · {a.gender}</p>
                  <p>{a.station}</p>
                </div>
                <p className="text-lg font-bold text-primary">PKR {(a.purchasePrice * 1.3).toLocaleString()}</p>
                <div className="flex gap-1 pt-1">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Eye className="h-3 w-3" />View</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><Pencil className="h-3 w-3" />Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive gap-1"><Trash2 className="h-3 w-3" />Remove</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Listing</DialogTitle></DialogHeader>
          <form onSubmit={handlePublish} className="space-y-3">
            <select name="cattleId" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select Animal (Ready for Sale)</option>
              {readyAnimals.map(a => <option key={a.id} value={a.id}>{a.id} — {a.breed} ({a.weight}kg)</option>)}
            </select>
            <div className="p-3 bg-muted/50 rounded text-xs text-muted-foreground">
              Auto-filled fields (breed, teeth, weight, station) will be pulled from the cattle record.
            </div>
            <Input name="price" type="number" placeholder="Asking Price (PKR)" required />
            <textarea name="description" placeholder="Description / Notes (optional)" className="w-full h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            <Button type="submit" className="w-full">Publish Listing</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketplaceManagement;
