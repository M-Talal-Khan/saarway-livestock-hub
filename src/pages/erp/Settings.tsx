import { useState } from 'react';
import { erpStations } from '@/data/erp/erpStations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

const SettingsPage = () => {
  const [addStation, setAddStation] = useState(false);
  const [vaccines, setVaccines] = useState(mandatoryVaccines);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Settings</h1>

      <Tabs defaultValue="farm">
        <TabsList className="flex-wrap">
          <TabsTrigger value="farm">Farm Profile</TabsTrigger>
          <TabsTrigger value="stations">Station Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="defaults">Cattle Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="farm">
          <Card>
            <CardContent className="p-6 space-y-4 max-w-lg">
              <div><Label>Farm Name</Label><Input defaultValue="GRASS Farms" /></div>
              <div><Label>Owner Name</Label><Input defaultValue="Muhammad Talal Khan" /></div>
              <div><Label>Address</Label><Input defaultValue="GT Road, Kasur" /></div>
              <div><Label>Contact Number</Label><Input defaultValue="0300-1234567" /></div>
              <div><Label>Email</Label><Input defaultValue="admin@grassfarms.pk" /></div>
              <div>
                <Label>Farming Type</Label>
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue="Meat">
                  <option>Meat</option><option>Dairy</option><option>Both</option>
                </select>
              </div>
              <Button onClick={() => toast({ title: 'Saved', description: 'Farm profile updated' })}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations">
          <div className="flex justify-end mb-3">
            <Button onClick={() => setAddStation(true)} className="gap-1"><Plus className="h-4 w-4" /> Add New Station</Button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Name</TableHead><TableHead>Location</TableHead><TableHead>Type</TableHead><TableHead>Rent</TableHead><TableHead>Contract</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {erpStations.map(s => (
                  <TableRow key={s.tag}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.location}</TableCell>
                    <TableCell><StatusBadge status={s.type} /></TableCell>
                    <TableCell>{s.rentAmount ? `PKR ${s.rentAmount.toLocaleString()}` : '—'}</TableCell>
                    <TableCell className="text-xs">{s.contractStart ? `${s.contractStart} → ${s.contractEnd}` : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Dialog open={addStation} onOpenChange={setAddStation}>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Station</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); setAddStation(false); toast({ title: 'Station added' }); }} className="space-y-3">
                <Input placeholder="Station Name" required />
                <Input placeholder="City / Location" required />
                <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="Owned">Owned</option><option value="Rented">Rented</option>
                </select>
                <Input placeholder="Rent Amount (if rented)" type="number" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" placeholder="Contract Start" />
                  <Input type="date" placeholder="Contract End" />
                </div>
                <Input placeholder="Owner Name" />
                <Input placeholder="Owner Contact" />
                <Button type="submit" className="w-full">Add Station</Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="p-6 space-y-4 max-w-lg">
              {notificationPrefs.map(n => (
                <div key={n.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardContent className="p-6 space-y-4 max-w-lg">
              <p className="text-sm text-muted-foreground">Change password for the currently logged-in Admin account.</p>
              <div><Label>Current Password</Label><Input type="password" /></div>
              <div><Label>New Password</Label><Input type="password" /></div>
              <div><Label>Confirm New Password</Label><Input type="password" /></div>
              <Button onClick={() => toast({ title: 'Password Updated' })}>Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults">
          <Card>
            <CardContent className="p-6 space-y-6 max-w-lg">
              <div>
                <Label>Default Transport Cost (per animal)</Label>
                <Input type="number" defaultValue={2550} />
              </div>
              <div>
                <Label>Auto-status Timing (days before Active → Fattening)</Label>
                <Input type="number" defaultValue={7} />
              </div>
              <div>
                <Label className="mb-2 block">Mandatory Vaccine List</Label>
                {vaccines.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <Input value={v.name} className="flex-1" readOnly />
                    <Input value={v.frequency} className="w-28" readOnly />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setVaccines(prev => prev.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="gap-1 mt-1" onClick={() => setVaccines(prev => [...prev, { name: 'New Vaccine', frequency: 'Annual' }])}><Plus className="h-3 w-3" />Add Vaccine</Button>
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
