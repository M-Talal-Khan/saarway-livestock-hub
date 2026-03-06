import { useState } from 'react';
import { purchases } from '@/data/erp/purchases';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const stations = ['Station 1 — Main', 'Station 2 — East Wing', 'Station 3 — Pattoki Road'];
const breeds = ['Sahiwal', 'Friesian', 'Cross', 'Cholistani', 'Nili-Ravi'];

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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Buying</h1>
        <Button onClick={() => { setAddOpen(true); setStep(1); setAnimals([]); }} className="gap-1"><Plus className="h-4 w-4" /> Add Purchase</Button>
      </div>

      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="p-3 flex gap-2 items-start text-xs text-blue-800">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          Each animal will appear in Cattle Management with status 'Active'. Total cost auto-posts to Finance as an expense.
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader><TableRow className="bg-muted/50">
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
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{step === 1 ? 'Step 1: Purchase Details' : 'Step 2: Add Animals'}</DialogTitle></DialogHeader>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-3">
              <Input name="supplier" placeholder="Supplier / Place" required />
              <Input name="date" type="date" required />
              <Input name="animals" type="number" min={1} placeholder="Number of Animals" required onChange={e => setNumAnimals(Number(e.target.value))} />
              <div>
                <label className="text-xs text-muted-foreground">Transport Cost (auto: {numAnimals} × PKR 2,550)</label>
                <Input name="transport" type="number" defaultValue={numAnimals * 2550} />
              </div>
              <select name="station" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                {stations.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Button type="submit" className="w-full">Save & Add Animals →</Button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Added {animals.length} of {numAnimals}</p>
              {animals.length < numAnimals && (
                <form onSubmit={addAnimal} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <select name="breed" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      {breeds.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select name="teeth" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      {[2,4,6,8].map(t => <option key={t} value={t}>{t} teeth</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="weight" type="number" placeholder="Weight (kg)" required />
                    <select name="gender" required className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="Male">Male</option><option value="Female">Female</option>
                    </select>
                  </div>
                  <Input name="price" type="number" placeholder="Purchase Price (PKR)" required />
                  <Button type="submit" variant="secondary" className="w-full">Add Animal</Button>
                </form>
              )}
              {animals.length > 0 && (
                <div className="text-xs space-y-1">
                  {animals.map((a, i) => (
                    <div key={i} className="flex justify-between p-2 bg-background rounded border border-border">
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
