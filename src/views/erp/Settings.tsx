"use client";

import { useState } from 'react';
import { erpStations } from '@/data/erp/erpStations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const mandatoryVaccines = [
  { name: 'FMD', frequency: '6 months' },
  { name: 'HS', frequency: 'Annual' },
  { name: 'BQ', frequency: 'Annual' },
  { name: 'LSD', frequency: 'Annual' },
  { name: 'Deworming', frequency: '3 months' },
];

const notificationPrefs = [
  { id: 'rent', label: 'Rent Due', desc: 'Notify when station rent payment is due' },
  { id: 'vax', label: 'Vaccination Due', desc: 'Alert for upcoming and overdue vaccinations' },
  { id: 'feed', label: 'Low Feed', desc: 'Alert when feed stock drops below threshold' },
  { id: 'marketplace', label: 'Marketplace Fees', desc: 'Monthly subscription fee reminders' },
  { id: 'weight', label: 'Weight Log Reminders', desc: 'Remind workers to log weights' },
  { id: 'contract', label: 'Contract Expiry', desc: 'Alert before rental contracts expire' },
];

interface SecurityTabProps {
  currentUser: { role: string; sessionToken: string } | null;
  resetSent: boolean;
  resetRequesting: boolean;
  onRequest: () => void;
}

const SecurityTab = ({ currentUser, resetSent, resetRequesting, onRequest }: SecurityTabProps) => {
  if (!currentUser) return null;

  if (currentUser.role !== 'Admin') {
    return (
      <Card className="erp-glass-card-subtle">
        <CardContent className="p-6 max-w-lg">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
            <KeyRound className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Forgot your password?</p>
              <p className="text-sm text-muted-foreground mt-1">Contact your farm admin to reset your password.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (resetSent) {
    return (
      <Card className="erp-glass-card-subtle">
        <CardContent className="p-6 max-w-lg">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-primary" />
            <p className="font-medium text-foreground">Password reset request sent!</p>
            <p className="text-sm text-muted-foreground">
              The super admin will reset your password and send the new credentials to you directly.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="erp-glass-card-subtle">
      <CardContent className="p-6 max-w-lg space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
          <KeyRound className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Password Reset via Super Admin</p>
            <p className="text-sm text-muted-foreground mt-1">
              Passwords are managed by the platform super admin. Click below to send a reset request — they will generate a new password and share it with you.
            </p>
          </div>
        </div>
        <Button onClick={onRequest} disabled={resetRequesting} className="gap-2">
          {resetRequesting && <Loader2 className="w-4 h-4 animate-spin" />}
          Request Password Reset
        </Button>
      </CardContent>
    </Card>
  );
};

const SettingsPage = () => {
  const { currentUser } = useAuth();
  const [addStation, setAddStation] = useState(false);
  const [vaccines, setVaccines] = useState(mandatoryVaccines);
  const [resetRequesting, setResetRequesting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handlePasswordResetRequest = async () => {
    setResetRequesting(true);
    const res = await fetch('/api/farm-auth/password-reset-request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${currentUser?.sessionToken ?? ''}` },
    });
    const data = await res.json();
    setResetRequesting(false);
    if (!res.ok) {
      toast({ title: 'Request failed', description: data.error, variant: 'destructive' });
      return;
    }
    setResetSent(true);
    toast({ title: 'Request sent', description: 'Super admin will reset your password and share the new one with you.' });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground erp-slide-up">Settings</h1>

      <Tabs defaultValue="farm">
        <TabsList>
          <TabsTrigger value="farm">Farm Profile</TabsTrigger>
          <TabsTrigger value="stations">Station Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="defaults">Cattle Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="farm">
          <Card className="erp-glass-card-subtle">
            <CardContent className="p-6 space-y-5 max-w-lg">
              {[
                { label: 'Farm Name', defaultValue: 'GRASS Farms' },
                { label: 'Owner Name', defaultValue: 'Muhammad Talal Khan' },
                { label: 'Address', defaultValue: 'GT Road, Kasur' },
                { label: 'Contact Number', defaultValue: '0300-1234567' },
                { label: 'Email', defaultValue: 'admin@grassfarms.pk' },
              ].map(f => (
                <div key={f.label} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Input defaultValue={f.defaultValue} />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Farming Type</Label>
                <Select defaultValue="Meat">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => toast({ title: 'Saved', description: 'Farm profile updated' })}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddStation(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add New Station</Button>
          </div>
          <Card className="erp-glass-card-subtle">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Type</TableHead><TableHead>Rent</TableHead><TableHead>Contract</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {erpStations.map(s => (
                    <TableRow key={s.tag} className="erp-table-row">
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.location}</TableCell>
                      <TableCell><StatusBadge status={s.type} /></TableCell>
                      <TableCell>{s.rentAmount ? `PKR ${s.rentAmount.toLocaleString()}` : '—'}</TableCell>
                      <TableCell className="text-xs">{s.contractStart ? `${s.contractStart} → ${s.contractEnd}` : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Dialog open={addStation} onOpenChange={setAddStation}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Station</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); setAddStation(false); toast({ title: 'Station added' }); }} className="space-y-4">
                <div className="space-y-2"><Label>Station Name</Label><Input placeholder="e.g. Station 4 — North" required /></div>
                <div className="space-y-2"><Label>City / Location</Label><Input placeholder="e.g. Lahore" required /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select defaultValue="Owned">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Owned">Owned</SelectItem><SelectItem value="Rented">Rented</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Rent Amount (if rented)</Label><Input placeholder="e.g. 25000" type="number" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Contract Start</Label><Input type="date" /></div>
                  <div className="space-y-2"><Label>Contract End</Label><Input type="date" /></div>
                </div>
                <div className="space-y-2"><Label>Owner Name</Label><Input placeholder="e.g. Rana Asif" /></div>
                <div className="space-y-2"><Label>Owner Contact</Label><Input placeholder="e.g. 0300-1234567" /></div>
                <DialogFooter>
                  <Button variant="ghost" type="button" onClick={() => setAddStation(false)}>Cancel</Button>
                  <Button type="submit">Add Station</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="erp-glass-card-subtle">
            <CardContent className="p-6 space-y-5 max-w-lg">
              {notificationPrefs.map(n => (
                <div key={n.id} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab
            currentUser={currentUser}
            resetSent={resetSent}
            resetRequesting={resetRequesting}
            onRequest={handlePasswordResetRequest}
          />
        </TabsContent>

        <TabsContent value="defaults">
          <Card className="erp-glass-card-subtle">
            <CardContent className="p-6 space-y-6 max-w-lg">
              <div className="space-y-2">
                <Label>Default Transport Cost (per animal)</Label>
                <Input type="number" defaultValue={2550} />
              </div>
              <div className="space-y-2">
                <Label>Auto-status Timing (days before Active → Fattening)</Label>
                <Input type="number" defaultValue={7} />
              </div>
              <div className="space-y-2">
                <Label className="mb-3 block">Mandatory Vaccine List</Label>
                {vaccines.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input value={v.name} className="flex-1" readOnly />
                    <Input value={v.frequency} className="w-28" readOnly />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setVaccines(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1.5 mt-1" onClick={() => setVaccines(prev => [...prev, { name: 'New Vaccine', frequency: 'Annual' }])}><Plus className="h-3.5 w-3.5" />Add Vaccine</Button>
              </div>
              <Button onClick={() => toast({ title: 'Defaults Saved' })}>Save Defaults</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
