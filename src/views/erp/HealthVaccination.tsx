"use client";

import { useState } from 'react';
import { treatments as initialTreatments, Treatment } from '@/data/erp/treatments';
import { vaccinations as initialVaccinations, Vaccination } from '@/data/erp/vaccinations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    return '';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Health & Vaccination</h1>

      {!isVet && (
        <Card className="border-sw-sky-400/30 bg-sw-sky-400/5">
          <CardContent className="p-3 flex gap-2 items-start text-xs">
            <Info className="h-4 w-4 mt-0.5 shrink-0 text-sw-sky-400" />
            <span className="text-foreground/70">Health records are view-only. Contact your Veterinarian to add or edit records.</span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="treatments">
        <TabsList>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="space-y-4">
          {isVet && (
            <div className="flex justify-end">
              <Button onClick={() => setAddTreatment(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Treatment</Button>
            </div>
          )}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
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
                      <TableCell><StatusBadge status={t.outcome} /></TableCell>
                      <TableCell>{t.vet}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-4">
          {isVet && (
            <div className="flex justify-end">
              <Button onClick={() => setAddVaccination(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Vaccination</Button>
            </div>
          )}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Cattle</TableHead><TableHead>Vaccine</TableHead><TableHead>Date Given</TableHead><TableHead>Next Due</TableHead><TableHead>Status</TableHead><TableHead>Vet</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {vaccinationData.map(v => (
                    <TableRow key={v.id} className={vacRowClass(v.status)}>
                      <TableCell className="font-mono text-xs">{v.cattleId}</TableCell>
                      <TableCell>{v.vaccine}</TableCell>
                      <TableCell>{v.dateGiven || '—'}</TableCell>
                      <TableCell>{v.nextDue}</TableCell>
                      <TableCell><StatusBadge status={v.status} /></TableCell>
                      <TableCell>{v.vet || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Treatment Modal */}
      <Dialog open={addTreatment} onOpenChange={setAddTreatment}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Treatment</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTreatment} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cattle ID</label>
              <Input name="cattleId" placeholder="e.g. F001-0001" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date</label>
              <Input name="date" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Condition / Diagnosis</label>
              <Input name="condition" placeholder="e.g. Foot rot" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Treatment Given</label>
              <Input name="treatment" placeholder="e.g. Antibiotics course" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Medicine + Dosage</label>
              <Input name="medicine" placeholder="e.g. Oxytetracycline 20ml" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cost (PKR)</label>
              <Input name="cost" type="number" placeholder="e.g. 500" required />
              <p className="text-[10px] text-muted-foreground">Cost auto-posts to Finance as Medical expense</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Outcome</label>
              <Select name="outcome" required defaultValue="Recovered">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recovered">Recovered</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Died">Died</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setAddTreatment(false)}>Cancel</Button>
              <Button type="submit">Save Treatment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Vaccination Modal */}
      <Dialog open={addVaccination} onOpenChange={setAddVaccination}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vaccination</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); setAddVaccination(false); toast({ title: 'Vaccination recorded' }); }} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Cattle ID</label>
              <Input name="cattleId" placeholder="e.g. F001-0001" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Vaccine</label>
              <Select name="vaccine" required defaultValue="FMD">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['FMD', 'HS', 'BQ', 'LSD', 'Deworming'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Date Given</label>
              <Input name="dateGiven" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Next Due</label>
              <Input name="nextDue" type="date" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notes (optional)</label>
              <Input name="notes" placeholder="Any additional notes" />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setAddVaccination(false)}>Cancel</Button>
              <Button type="submit">Save Vaccination</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthVaccination;
