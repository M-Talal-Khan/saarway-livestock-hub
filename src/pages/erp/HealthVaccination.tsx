import { useState } from 'react';
import { treatments as initialTreatments, Treatment } from '@/data/erp/treatments';
import { vaccinations as initialVaccinations, Vaccination } from '@/data/erp/vaccinations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const HealthVaccination = () => {
  const { currentUser } = useAuth();
  const isVet = currentUser?.role === 'Veterinarian';
  const [treatmentData, setTreatmentData] = useState<Treatment[]>(initialTreatments);
  const [vaccinationData] = useState<Vaccination[]>(initialVaccinations);
  const [addTreatment, setAddTreatment] = useState(false);
  const [addVaccination, setAddVaccination] = useState(false);

  const handleAddTreatment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newT: Treatment = {
      id: `T-${String(treatmentData.length + 1).padStart(3, '0')}`,
      cattleId: fd.get('cattleId') as string,
      date: fd.get('date') as string,
      condition: fd.get('condition') as string,
      treatment: fd.get('treatment') as string,
      medicine: fd.get('medicine') as string,
      cost: Number(fd.get('cost')),
      outcome: fd.get('outcome') as Treatment['outcome'],
      vet: currentUser?.fullName || 'Dr. Imran',
    };
    setTreatmentData(prev => [...prev, newT]);
    setAddTreatment(false);
    toast({ title: 'Treatment Added', description: `Treatment for ${newT.cattleId} recorded` });
  };

  const vacRowClass = (status: string) => {
    if (status === 'Overdue') return 'bg-red-50';
    if (status === 'Upcoming') return 'bg-amber-50';
    if (status === 'Completed') return 'bg-green-50';
    return '';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Health & Vaccination</h1>

      {!isVet && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="p-3 flex gap-2 items-start text-xs text-blue-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            Health records are view-only. Contact your Veterinarian to add or edit records.
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="treatments">
        <TabsList>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments">
          {isVet && (
            <div className="mb-3 flex justify-end">
              <Button onClick={() => setAddTreatment(true)} className="gap-1"><Plus className="h-4 w-4" /> Add Treatment</Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Cattle</TableHead><TableHead>Date</TableHead><TableHead>Condition</TableHead><TableHead>Treatment</TableHead><TableHead>Medicine</TableHead><TableHead>Cost</TableHead><TableHead>Outcome</TableHead><TableHead>Vet</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {treatmentData.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.cattleId}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.condition}</TableCell>
                    <TableCell>{t.treatment}</TableCell>
                    <TableCell className="text-xs">{t.medicine}</TableCell>
                    <TableCell>PKR {t.cost.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={t.outcome} pulse={t.outcome === 'Ongoing'} /></TableCell>
                    <TableCell>{t.vet}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vaccinations">
          {isVet && (
            <div className="mb-3 flex justify-end">
              <Button onClick={() => setAddVaccination(true)} className="gap-1"><Plus className="h-4 w-4" /> Add Vaccination</Button>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Cattle</TableHead><TableHead>Vaccine</TableHead><TableHead>Date Given</TableHead><TableHead>Next Due</TableHead><TableHead>Status</TableHead><TableHead>Vet</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {vaccinationData.map(v => (
                  <TableRow key={v.id} className={vacRowClass(v.status)}>
                    <TableCell className="font-mono text-xs">{v.cattleId}</TableCell>
                    <TableCell>{v.vaccine}</TableCell>
                    <TableCell>{v.dateGiven || '—'}</TableCell>
                    <TableCell>{v.nextDue}</TableCell>
                    <TableCell><StatusBadge status={v.status} pulse={v.status === 'Overdue'} /></TableCell>
                    <TableCell>{v.vet || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Modal */}
      <Dialog open={addTreatment} onOpenChange={setAddTreatment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Treatment</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTreatment} className="space-y-3">
            <Input name="cattleId" placeholder="Cattle ID (e.g. F001-0001)" required />
            <Input name="date" type="date" required />
            <Input name="condition" placeholder="Condition / Diagnosis" required />
            <Input name="treatment" placeholder="Treatment given" required />
            <Input name="medicine" placeholder="Medicine + dosage" required />
            <Input name="cost" type="number" placeholder="Cost (PKR)" required />
            <p className="text-[10px] text-muted-foreground">Cost auto-posts to Finance as Medical expense</p>
            <select name="outcome" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="Recovered">Recovered</option><option value="Ongoing">Ongoing</option><option value="Died">Died</option>
            </select>
            <Button type="submit" className="w-full">Save Treatment</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Modal */}
      <Dialog open={addVaccination} onOpenChange={setAddVaccination}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vaccination</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddVaccination(false); toast({ title: 'Vaccination recorded' }); }} className="space-y-3">
            <Input name="cattleId" placeholder="Cattle ID" required />
            <select name="vaccine" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              {['FMD', 'HS', 'BQ', 'LSD', 'Deworming'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <Input name="dateGiven" type="date" required />
            <Input name="nextDue" type="date" required />
            <Input name="notes" placeholder="Notes (optional)" />
            <Button type="submit" className="w-full">Save Vaccination</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthVaccination;
