"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Loader2, KeyRound, CheckCircle2, Power, PowerOff, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FarmProfile {
  farm_name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  farming_type: string;
  description: string;
}

interface Station {
  id: string;
  station_tag: string;
  station_name: string;
  city: string;
  is_active: boolean;
}

const PREF_KEY = (farmId: string) => `erp_notif_prefs_${farmId}`;

const notificationPrefs = [
  { id: 'rent', label: 'Rent Due', desc: 'Notify when station rent payment is due' },
  { id: 'vax', label: 'Vaccination Due', desc: 'Alert for upcoming and overdue vaccinations' },
  { id: 'feed', label: 'Low Feed', desc: 'Alert when feed stock drops below threshold' },
  { id: 'marketplace', label: 'Marketplace Fees', desc: 'Monthly subscription fee reminders' },
  { id: 'weight', label: 'Weight Log Reminders', desc: 'Remind workers to log weights' },
  { id: 'contract', label: 'Contract Expiry', desc: 'Alert before rental contracts expire' },
];

function loadPrefs(farmId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PREF_KEY(farmId));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function savePrefs(farmId: string, prefs: Record<string, boolean>) {
  try { localStorage.setItem(PREF_KEY(farmId), JSON.stringify(prefs)); } catch { }
}

// ── Farm Profile Tab ──────────────────────────────────────────────────────────

const FarmProfileTab = ({ token }: { token: string }) => {
  const [profile, setProfile] = useState<FarmProfile>({
    farm_name: '', owner_name: '', phone: '', email: '', city: '', farming_type: 'meat', description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/erp/settings/farm', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.farm) setProfile({
          farm_name: d.farm.farm_name ?? '',
          owner_name: d.farm.owner_name ?? '',
          phone: d.farm.phone ?? '',
          email: d.farm.email ?? '',
          city: d.farm.city ?? '',
          farming_type: d.farm.farming_type ?? 'meat',
          description: d.farm.description ?? '',
        });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/erp/settings/farm', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmName: profile.farm_name,
          ownerName: profile.owner_name,
          phone: profile.phone,
          email: profile.email,
          city: profile.city,
          farmingType: profile.farming_type,
          description: profile.description,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Saved', description: 'Farm profile updated successfully.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed to save', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="erp-glass-card-subtle">
      <CardContent className="p-6 space-y-5 max-w-lg">
        {[
          { label: 'Farm Name', key: 'farm_name' as const, placeholder: 'e.g. GRASS Farms' },
          { label: 'Owner Name', key: 'owner_name' as const, placeholder: 'e.g. Muhammad Talal Khan' },
          { label: 'City', key: 'city' as const, placeholder: 'e.g. Kasur' },
          { label: 'Phone', key: 'phone' as const, placeholder: 'e.g. 0300-1234567' },
          { label: 'Email', key: 'email' as const, placeholder: 'e.g. admin@farm.pk' },
        ].map(f => (
          <div key={f.key} className="space-y-2">
            <Label>{f.label}</Label>
            <Input
              value={profile[f.key]}
              onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div className="space-y-2">
          <Label>Farming Type</Label>
          <Select value={profile.farming_type} onValueChange={v => setProfile(p => ({ ...p, farming_type: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="meat">Meat</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Description (optional)</Label>
          <Textarea
            value={profile.description}
            onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of your farm"
            rows={3}
          />
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

// ── Stations Tab ──────────────────────────────────────────────────────────────

const StationsTab = ({ token }: { token: string }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [form, setForm] = useState({ tag: '', name: '', city: '', type: 'owned' });
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      const r = await fetch('/api/farm-auth/stations?includeInactive=true', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setStations(d.stations ?? []);
    } catch { }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStations(); }, [fetchStations]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tag || !form.name || !form.city) {
      toast({ title: 'Error', description: 'Tag, name, and city are required', variant: 'destructive' }); return;
    }
    setAddSaving(true);
    try {
      const res = await fetch('/api/farm-auth/stations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationTag: form.tag, stationName: form.name, city: form.city }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Station added', description: `${form.name} created successfully.` });
      setAddOpen(false);
      setForm({ tag: '', name: '', city: '', type: 'owned' });
      await fetchStations();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setAddSaving(false); }
  };

  const handleToggleActive = async (stationId: string, currentlyActive: boolean) => {
    setActionId(stationId);
    try {
      const res = await fetch('/api/farm-auth/stations', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, action: currentlyActive ? 'close' : 'reactivate' }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({
        title: currentlyActive ? 'Station Closed' : 'Station Reactivated',
        description: currentlyActive
          ? 'Station is now closed and hidden from operations.'
          : 'Station is now active and visible again.',
      });
      await fetchStations();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setActionId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add New Station
        </Button>
      </div>
      <Card className="erp-glass-card-subtle">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : stations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No stations found. Add your first station.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map(s => (
                  <TableRow key={s.id} className={`erp-table-row ${!s.is_active ? 'opacity-50' : ''}`}>
                    <TableCell><StatusBadge status={s.station_tag} /></TableCell>
                    <TableCell className="font-medium">{s.station_name}</TableCell>
                    <TableCell>{s.city}</TableCell>
                    <TableCell>
                      {s.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><Power className="h-3 w-3" />Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><PowerOff className="h-3 w-3" />Closed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 text-xs gap-1.5 ${s.is_active
                            ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        disabled={actionId === s.id}
                        onClick={() => handleToggleActive(s.id, s.is_active)}
                      >
                        {actionId === s.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : s.is_active ? (
                          <><PowerOff className="h-3.5 w-3.5" />Close</>
                        ) : (
                          <><Power className="h-3.5 w-3.5" />Reactivate</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Station</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Station Tag (short code)</Label>
              <Input
                placeholder="e.g. S4"
                value={form.tag}
                onChange={e => setForm(p => ({ ...p, tag: e.target.value.toUpperCase() }))}
                maxLength={6}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Station Name</Label>
              <Input
                placeholder="e.g. Station 4 — North"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>City / Location</Label>
              <Input
                placeholder="e.g. Lahore"
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addSaving}>
                {addSaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Add Station
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Notifications Prefs Tab ───────────────────────────────────────────────────

const NotificationsTab = ({ farmId }: { farmId: string }) => {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (farmId) setPrefs(loadPrefs(farmId));
  }, [farmId]);

  const toggle = (id: string, value: boolean) => {
    const next = { ...prefs, [id]: value };
    setPrefs(next);
    savePrefs(farmId, next);
  };

  return (
    <Card className="erp-glass-card-subtle">
      <CardContent className="p-6 space-y-5 max-w-lg">
        {notificationPrefs.map(n => (
          <div key={n.id} className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">{n.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
            </div>
            <Switch
              checked={prefs[n.id] !== false}
              onCheckedChange={v => toggle(n.id, v)}
            />
          </div>
        ))}
        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          Preferences are saved locally per device. Real-time alerts appear in the notification bell.
        </p>
      </CardContent>
    </Card>
  );
};

// ── Security Tab ──────────────────────────────────────────────────────────────

const SecurityTab = ({ token, role }: { token: string; role: string }) => {
  const [resetRequesting, setResetRequesting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleRequest = async () => {
    setResetRequesting(true);
    const res = await fetch('/api/farm-auth/password-reset-request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setResetRequesting(false);
    if (!res.ok) {
      toast({ title: 'Request failed', description: data.error, variant: 'destructive' }); return;
    }
    setResetSent(true);
    toast({ title: 'Request sent', description: 'Super admin will reset your password.' });
  };

  if (role !== 'Admin') {
    return (
      <Card className="erp-glass-card-subtle">
        <CardContent className="p-6 max-w-lg">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
            <KeyRound className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Forgot your password?</p>
              <p className="text-sm text-muted-foreground mt-1">Contact your farm admin to request a password reset.</p>
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
            <p className="font-medium text-foreground">Reset request sent!</p>
            <p className="text-sm text-muted-foreground">The super admin will generate a new password and share it with you directly.</p>
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
        <Button onClick={handleRequest} disabled={resetRequesting} className="gap-2">
          {resetRequesting && <Loader2 className="w-4 h-4 animate-spin" />} Request Password Reset
        </Button>
      </CardContent>
    </Card>
  );
};

// ── Cattle Defaults Tab ───────────────────────────────────────────────────────

const DEFAULTS_KEY = (farmId: string) => `erp_cattle_defaults_${farmId}`;

interface CattleDefaults {
  transportCost: number;
  vaccines: { name: string; frequency: string }[];
}

const defaultVaccines = [
  { name: 'FMD', frequency: '6 months' },
  { name: 'HS', frequency: 'Annual' },
  { name: 'BQ', frequency: 'Annual' },
  { name: 'LSD', frequency: 'Annual' },
  { name: 'Deworming', frequency: '3 months' },
];

function loadDefaults(farmId: string): CattleDefaults {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY(farmId));
    return raw ? JSON.parse(raw) : { transportCost: 2550, vaccines: defaultVaccines };
  } catch { return { transportCost: 2550, vaccines: defaultVaccines }; }
}

function saveDefaults(farmId: string, d: CattleDefaults) {
  try { localStorage.setItem(DEFAULTS_KEY(farmId), JSON.stringify(d)); } catch { }
}

const CattleDefaultsTab = ({ farmId }: { farmId: string }) => {
  const [defaults, setDefaults] = useState<CattleDefaults>({ transportCost: 2550, vaccines: defaultVaccines });

  useEffect(() => {
    if (farmId) setDefaults(loadDefaults(farmId));
  }, [farmId]);

  const updateVaccine = (i: number, field: 'name' | 'frequency', value: string) => {
    setDefaults(prev => ({
      ...prev,
      vaccines: prev.vaccines.map((v, j) => j === i ? { ...v, [field]: value } : v),
    }));
  };

  const removeVaccine = (i: number) => {
    setDefaults(prev => ({ ...prev, vaccines: prev.vaccines.filter((_, j) => j !== i) }));
  };

  const addVaccine = () => {
    setDefaults(prev => ({ ...prev, vaccines: [...prev.vaccines, { name: 'New Vaccine', frequency: 'Annual' }] }));
  };

  const handleSave = () => {
    saveDefaults(farmId, defaults);
    toast({ title: 'Defaults saved', description: 'Cattle defaults updated for this farm.' });
  };

  return (
    <Card className="erp-glass-card-subtle">
      <CardContent className="p-6 space-y-6 max-w-lg">
        <div className="space-y-2">
          <Label>Default Transport Cost per Animal (PKR)</Label>
          <Input
            type="number"
            value={defaults.transportCost}
            onChange={e => setDefaults(p => ({ ...p, transportCost: Number(e.target.value) }))}
          />
          <p className="text-xs text-muted-foreground">Used as default in the Buying module (editable per purchase).</p>
        </div>
        <div className="space-y-3">
          <Label className="block">Mandatory Vaccine List</Label>
          {defaults.vaccines.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={v.name}
                onChange={e => updateVaccine(i, 'name', e.target.value)}
                className="flex-1"
                placeholder="Vaccine name"
              />
              <Input
                value={v.frequency}
                onChange={e => updateVaccine(i, 'frequency', e.target.value)}
                className="w-28"
                placeholder="Frequency"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removeVaccine(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1.5 mt-1" onClick={addVaccine}>
            <Plus className="h-3.5 w-3.5" /> Add Vaccine
          </Button>
        </div>
        <Button onClick={handleSave}>Save Defaults</Button>
      </CardContent>
    </Card>
  );
};

// ── Main Settings Page ────────────────────────────────────────────────────────

const SettingsPage = () => {
  const { currentUser, currentFarm } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const farmId = currentFarm?.id ?? '';
  const role = currentUser?.role ?? '';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground erp-slide-up">Settings</h1>

      <Tabs defaultValue="farm">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="farm">Farm Profile</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="defaults">Cattle Defaults</TabsTrigger>
        </TabsList>

        <TabsContent value="farm" className="mt-4">
          <FarmProfileTab token={token} />
        </TabsContent>

        <TabsContent value="stations" className="mt-4">
          <StationsTab token={token} />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationsTab farmId={farmId} />
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <SecurityTab token={token} role={role} />
        </TabsContent>

        <TabsContent value="defaults" className="mt-4">
          <CattleDefaultsTab farmId={farmId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
