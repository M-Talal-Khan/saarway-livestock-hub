import { useState } from 'react';
import { purchases } from '@/data/erp/purchases';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const stationOpts = ['Station 1 — Main', 'Station 2 — East Wing', 'Station 3 — Pattoki Road'];
const breedOpts = ['Sahiwal', 'Friesian', 'Cross', 'Cholistani', 'Nili-Ravi'];

const Buying = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [numAnimals, setNumAnimals] = useState(1);
  const [animals, setAnimals] = useState<{ breed: string; teeth: number; weight: number; gender: string; price: number }[]>([]);

  const handleStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setNumAnimals(Number(fd.get('animals')));
    setStep(2);
  };

  const addAnimal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setAnimals(prev => [...prev, {
      breed: fd.get('breed') as string,
      teeth: Number(fd.get('teeth')),
      weight: Number(fd.get('weight')),
      gender: fd.get('gender') as string,
      price: Number(fd.get('price')),
    }]);
    e.currentTarget.reset();
  };

  const finalisePurchase = () => {
    toast({ title: 'Purchase Finalised', description: `${animals.length} animals added to Cattle Management` });
    setAddOpen(false);
    setStep(1);
    setAnimals([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Buying</h1>
        <Button onClick={() => { setAddOpen(true); setStep(1); setAnimals([]); }} className="gap-1.5"><Plus className="h-4 w-4" /> Add Purchase</Button>
      </div>

      <Card className="border-sw-sky-400/30 bg-sw-sky-400/5">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-sky-400" />
          <span className="text-foreground/70">Each animal will appear in Cattle Management with status 'Active'. Total cost auto-posts to Finance as an expense.</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Supplier</TableHead><TableHead>Date</TableHead><TableHead>Animals</TableHead><TableHead>Total Cost</TableHead><TableHead>Station</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {purchases.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.id}</TableCell>
                  <TableCell>{p.supplier}</TableCell>
                  <TableCell>{p.date}</TableCell>
                  <TableCell>{p.animals}</TableCell>
                  <TableCell className="font-medium">PKR {p.totalCost.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{p.station}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{step === 1 ? 'Step 1: Purchase Details' : 'Step 2: Add Animals'}</DialogTitle></DialogHeader>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Supplier / Place</label>
                <Input name="supplier" placeholder="e.g. Lahore Mandi" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date</label>
                <Input name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Number of Animals</label>
                <Input name="animals" type="number" min={1} placeholder="e.g. 3" required onChange={e => setNumAnimals(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Transport Cost (auto: {numAnimals} × PKR 2,550)</label>
                <Input name="transport" type="number" defaultValue={numAnimals * 2550} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Station</label>
                <Select name="station" required defaultValue={stationOpts[0]}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{stationOpts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit">Save & Add Animals →</Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Added {animals.length} of {numAnimals}</p>
              {animals.length < numAnimals && (
                <form onSubmit={addAnimal} className="space-y-3 p-4 bg-sw-green-50 rounded-lg border border-primary/10">
                  <div className="grid grid-cols-2 gap-3">
                    <Select name="breed" required defaultValue={breedOpts[0]}>
                      <SelectTrigger><SelectValue placeholder="Breed" /></SelectTrigger>
                      <SelectContent>{breedOpts.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select name="teeth" required defaultValue="2">
                      <SelectTrigger><SelectValue placeholder="Teeth" /></SelectTrigger>
                      <SelectContent>{[2,4,6,8].map(t => <SelectItem key={t} value={String(t)}>{t} teeth</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input name="weight" type="number" placeholder="Weight (kg)" required />
                    <Select name="gender" required defaultValue="Male">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Input name="price" type="number" placeholder="Purchase Price (PKR)" required />
                  <Button type="submit" variant="secondary" className="w-full">Add Animal</Button>
                </form>
              )}
              {animals.length > 0 && (
                <div className="text-xs space-y-1.5">
                  {animals.map((a, i) => (
                    <div key={i} className="flex justify-between p-3 bg-card rounded-lg border border-border">
                      <span>{a.breed} · {a.teeth}T · {a.weight}kg · {a.gender}</span>
                      <span className="font-medium">PKR {a.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              {animals.length === numAnimals && (
                <Button onClick={finalisePurchase} className="w-full">Finalise Purchase</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Buying;
