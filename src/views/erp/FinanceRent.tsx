"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, ChevronDown, DollarSign, Home, TrendingUp, TrendingDown, Loader2, Plus, Search, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  station_id: string | null;
  stations: { station_name: string; station_tag: string } | null;
}

interface RentDetail {
  id: string;
  rent_amount: number;
  rental_cycle: string;
  contract_start: string | null;
  contract_end: string | null;
  owner_name: string;
  owner_contact: string | null;
  payment_due_day: number | null;
  payment_status: string;
  last_paid_at: string | null;
  station_id: string;
  stations: { station_name: string; station_tag: string; city: string } | null;
}

interface SalaryRecord {
  id: string;
  staff_name: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  farm_users: { full_name: string; role: string } | null;
}

interface FarmUser {
  id: string;
  fullName: string;
  role: string;
  stationName: string;
  isActive: boolean;
}

const CHART_TOOLTIP_STYLE = {
  background: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderTop: '3px solid hsl(120,50%,48%)', padding: '12px 16px',
};
const CHART_CURSOR = { fill: 'rgba(61,184,61,0.06)' };

const PIE_COLORS = ['#3db83d', '#e8c24a', '#e85858', '#4dc8e8', '#a855f7', '#f97316'];

const autoIntegrations = [
  { source: 'Purchase saved', creates: 'Expense: Cattle Purchase' },
  { source: 'Sale recorded', creates: 'Income: Cattle Sale' },
  { source: 'Treatment added', creates: 'Expense: Medical/Health' },
  { source: 'Rent marked paid', creates: 'Expense: Station Rental' },
  { source: 'Salary entry added', creates: 'Expense: Salary' },
  { source: 'Feed stock-in added', creates: 'Expense: Feed' },
];

// ── Component ─────────────────────────────────────────────────────────────────

const formatCategory = (cat: string) => {
  return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

interface Station { id: string; station_name: string }

const FinanceRent = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canAccess = ['Admin', 'Accounts Officer'].includes(role);
  const isAdmin = role === 'Admin';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rentDetails, setRentDetails] = useState<RentDetail[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const [stationFilter, setStationFilter] = useState(currentStation?.id ?? 'All');

  useEffect(() => {
    if (currentStation?.id) setStationFilter(currentStation.id);
  }, [currentStation?.id]);

  // Salary add modal
  const [addSalary, setAddSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ staffName: '', farmUserId: '', amount: '', paymentDate: '', notes: '' });
  const [salarySaving, setSalarySaving] = useState(false);
  const [farmUsers, setFarmUsers] = useState<FarmUser[]>([]);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);

  // Mark rent paid
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    if (!canAccess) { setLoading(false); return; }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [txRes, rentRes, salRes, usersRes, stationsRes] = await Promise.all([
        fetch('/api/erp/finance?months=6', { headers }),
        fetch('/api/erp/finance/rent', { headers }),
        fetch('/api/erp/finance/salaries', { headers }),
        fetch('/api/farm-auth/users', { headers }),
        fetch('/api/farm-auth/stations', { headers }),
      ]);
      const [txd, rentd, sald, usersd, stationsd] = await Promise.all([txRes.json(), rentRes.json(), salRes.json(), usersRes.json(), stationsRes.json()]);
      setTransactions(txd.transactions ?? []);
      setRentDetails(rentd.rentDetails ?? []);
      setSalaries(sald.salaries ?? []);
      setFarmUsers((usersd.users ?? []).filter((u: FarmUser) => u.isActive));
      setStations(stationsd.stations ?? []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load finance data', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token, canAccess]);

  useEffect(() => { if (token) fetchAll(); }, [token, fetchAll]);

  // ── Charts ─────────────────────────────────────────────────────────────────

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredTransactions = useMemo(() => {
    if (stationFilter === 'All') return transactions;
    return transactions.filter(t => t.station_id === stationFilter);
  }, [transactions, stationFilter]);

  const filteredRentDetails = useMemo(() => {
    if (stationFilter === 'All') return rentDetails;
    return rentDetails.filter(r => r.station_id === stationFilter);
  }, [rentDetails, stationFilter]);

  const summary = useMemo(() => {
    const inc = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const exp = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income: inc, expenses: exp, pl: inc - exp };
  }, [filteredTransactions]);

  // ── Charts ─────────────────────────────────────────────────────────────────

  const monthlyChart = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>();
    filteredTransactions.forEach(t => {
      const mo = t.transaction_date.slice(0, 7); // YYYY-MM
      if (!map.has(mo)) map.set(mo, { income: 0, expenses: 0 });
      const entry = map.get(mo)!;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expenses += t.amount;
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, vals]) => ({ month: new Date(month + '-01').toLocaleDateString('en-PK', { month: 'short' }), ...vals }));
  }, [filteredTransactions]);

  const expensePie = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      const catName = formatCategory(t.category);
      map.set(catName, (map.get(catName) ?? 0) + t.amount);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const expenses = useMemo(() => filteredTransactions.filter(t => t.type === 'expense'), [filteredTransactions]);
  const income = useMemo(() => filteredTransactions.filter(t => t.type === 'income'), [filteredTransactions]);

  // ── Rent mark paid ─────────────────────────────────────────────────────────

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    try {
      const res = await fetch(`/api/erp/finance/rent/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-paid' }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setRentDetails(prev => prev.map(r => r.id === id ? { ...r, payment_status: 'paid', last_paid_at: new Date().toISOString() } : r));
      toast({ title: 'Rent marked as paid', description: 'Expense auto-posted to Finance.' });
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setMarkingPaid(null); }
  };

  // ── Salary add ─────────────────────────────────────────────────────────────

  const handleAddSalary = async () => {
    if (!salaryForm.staffName || !salaryForm.amount || !salaryForm.paymentDate) {
      toast({ title: 'Error', description: 'Fill all required fields', variant: 'destructive' }); return;
    }
    setSalarySaving(true);
    try {
      const res = await fetch('/api/erp/finance/salaries', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffName: salaryForm.staffName, farmUserId: salaryForm.farmUserId || null, amount: Number(salaryForm.amount), paymentDate: salaryForm.paymentDate, notes: salaryForm.notes || null }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      toast({ title: 'Salary recorded', description: 'Expense auto-posted to Finance.' });
      setAddSalary(false);
      setSalaryForm({ staffName: '', farmUserId: '', amount: '', paymentDate: '', notes: '' });
      setStaffSearch(''); setStaffPickerOpen(false);
      await fetchAll();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    } finally { setSalarySaving(false); }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <DollarSign className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Finance data is only visible to Admin and Accounts Officer.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const plPositive = summary.pl >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">Finance & Rent</h1>
        {isAdmin && stations.length > 1 && (
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Station" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Stations</SelectItem>
              {stations.map(s => <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: '6-Month P/L', value: `${plPositive ? '+' : ''}PKR ${summary.pl.toLocaleString()}`, Icon: DollarSign, border: 'border-l-[3px] border-l-primary', bg: 'bg-sw-green-100', color: plPositive ? 'text-primary' : 'text-destructive' },
          { label: 'Total Income', value: `PKR ${summary.income.toLocaleString()}`, Icon: TrendingUp, border: 'border-l-[3px] border-l-sw-gold-400', bg: 'bg-amber-100', color: 'text-amber-600' },
          { label: 'Total Expenses', value: `PKR ${summary.expenses.toLocaleString()}`, Icon: TrendingDown, border: 'border-l-[3px] border-l-destructive', bg: 'bg-red-100', color: 'text-destructive' },
        ].map(({ label, value, Icon, border, bg, color }) => (
          <Card key={label} className={`${border} erp-glass-card`}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      {monthlyChart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="erp-glass-card-subtle erp-stagger-4">
            <CardHeader className="pb-2"><CardTitle className="text-base">Income vs Expenses</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChart}>
                  <defs>
                    <linearGradient id="fGreenBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ad88a" /><stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="fGoldBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f5d87a" /><stop offset="100%" stopColor="#d4a934" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, '']} />
                  <Bar dataKey="income" fill="url(#fGreenBar)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                  <Bar dataKey="expenses" fill="url(#fGoldBar)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {expensePie.length > 0 && (
            <Card className="erp-glass-card-subtle erp-stagger-5">
              <CardHeader className="pb-2"><CardTitle className="text-base">Expenses by Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer key={`pie-${stationFilter}`} width="100%" height={240}>
                  <PieChart>
                    <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} cornerRadius={5} stroke="#fff" strokeWidth={2} label={({ name }) => name} animationDuration={1200}>
                      {expensePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Auto-Finance info */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer">
            <CardContent className="p-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-sw-sky-400" />
              <span className="text-sm font-medium text-foreground">Auto-Finance Integrations</span>
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-1">
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {autoIntegrations.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{a.source}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">→ {a.creates}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
        </TabsList>

        {/* Expenses */}
        <TabsContent value="expenses">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No expense records.</TableCell></TableRow>
                ) : expenses.map(t => (
                  <TableRow key={t.id} className="erp-table-row">
                    <TableCell>{t.transaction_date}</TableCell>
                    <TableCell><StatusBadge status={formatCategory(t.category)} /></TableCell>
                    <TableCell className="text-sm">{t.description ?? '—'}</TableCell>
                    <TableCell className="text-xs">{t.stations?.station_name ?? 'All Stations'}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">-PKR {t.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* Income */}
        <TabsContent value="income">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead>Description</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {income.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No income records.</TableCell></TableRow>
                ) : income.map(t => (
                  <TableRow key={t.id} className="erp-table-row">
                    <TableCell>{t.transaction_date}</TableCell>
                    <TableCell><StatusBadge status={formatCategory(t.category)} /></TableCell>
                    <TableCell className="text-sm">{t.description ?? '—'}</TableCell>
                    <TableCell className="text-xs">{t.stations?.station_name ?? 'All Stations'}</TableCell>
                    <TableCell className="text-right font-medium text-sw-green-700">+PKR {t.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* Rent */}
        <TabsContent value="rent">
          {filteredRentDetails.length === 0 ? (
            <Card><CardContent className="text-center text-muted-foreground py-10">No rent records found.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRentDetails.map(r => (
                <Card key={r.id} className="erp-glass-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">{r.stations?.station_name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{r.stations?.city ?? ''}</p>
                      </div>
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rent</span>
                        <span className="font-medium">PKR {r.rent_amount.toLocaleString()} / {r.rental_cycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner</span>
                        <span>{r.owner_name}</span>
                      </div>
                      {r.owner_contact && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact</span>
                          <span className="text-xs">{r.owner_contact}</span>
                        </div>
                      )}
                      {r.contract_start && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contract</span>
                          <span className="text-xs">{r.contract_start} → {r.contract_end ?? '—'}</span>
                        </div>
                      )}
                      {r.last_paid_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last Paid</span>
                          <span className="text-xs">{new Date(r.last_paid_at).toLocaleDateString('en-PK')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <StatusBadge status={r.payment_status} />
                        {r.payment_status !== 'paid' && (
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleMarkPaid(r.id)} disabled={markingPaid === r.id}>
                            {markingPaid === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Mark Paid'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Salary */}
        <TabsContent value="salary" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setSalaryForm({ staffName: '', farmUserId: '', amount: '', paymentDate: '', notes: '' }); setStaffSearch(''); setStaffPickerOpen(false); setAddSalary(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" /> Record Salary
            </Button>
          </div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Staff Name</TableHead><TableHead>Amount</TableHead><TableHead>Payment Date</TableHead><TableHead>Notes</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {salaries.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-10">No salary records.</TableCell></TableRow>
                ) : salaries.map(s => (
                  <TableRow key={s.id} className="erp-table-row">
                    <TableCell className="font-medium">{s.staff_name}</TableCell>
                    <TableCell className="font-medium">PKR {s.amount.toLocaleString()}</TableCell>
                    <TableCell>{s.payment_date}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.notes ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Add Salary Modal */}
      <Dialog open={addSalary} onOpenChange={setAddSalary}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Salary Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Staff picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Staff Member</label>
              {!staffPickerOpen ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal"
                  onClick={() => { setStaffSearch(''); setStaffPickerOpen(true); }}
                >
                  {salaryForm.staffName
                    ? <span className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" />{salaryForm.staffName}</span>
                    : <span className="text-muted-foreground">Select staff or type name below</span>}
                </Button>
              ) : (
                <div className="border rounded-lg p-2 space-y-2 bg-background">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8 h-8 text-sm"
                      placeholder="Search staff..."
                      value={staffSearch}
                      onChange={e => setStaffSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {farmUsers
                      .filter(u => !staffSearch || u.fullName.toLowerCase().includes(staffSearch.toLowerCase()) || u.role.toLowerCase().includes(staffSearch.toLowerCase()))
                      .map(u => (
                        <button
                          key={u.id}
                          type="button"
                          className={`w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-sw-green-50 transition-colors ${salaryForm.farmUserId === u.id ? 'bg-primary/5 font-medium' : ''}`}
                          onClick={() => { setSalaryForm(p => ({ ...p, staffName: u.fullName, farmUserId: u.id })); setStaffPickerOpen(false); }}
                        >
                          <span className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            {u.fullName}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{u.role} · {u.stationName}</span>
                        </button>
                      ))}
                    {farmUsers.filter(u => !staffSearch || u.fullName.toLowerCase().includes(staffSearch.toLowerCase()) || u.role.toLowerCase().includes(staffSearch.toLowerCase())).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No staff found</p>
                    )}
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={() => setStaffPickerOpen(false)}>Close</Button>
                </div>
              )}
              {/* Manual name override */}
              <Input
                value={salaryForm.staffName}
                onChange={e => setSalaryForm(p => ({ ...p, staffName: e.target.value, farmUserId: '' }))}
                placeholder="Or type name manually (e.g. contractor)"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Amount (PKR)</label>
                <Input type="number" min="0" value={salaryForm.amount} onChange={e => setSalaryForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 45000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payment Date</label>
                <Input type="date" value={salaryForm.paymentDate} onChange={e => setSalaryForm(p => ({ ...p, paymentDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input value={salaryForm.notes} onChange={e => setSalaryForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. January 2025 salary" />
            </div>
            <p className="text-[10px] text-muted-foreground">Amount auto-posts to Finance as Salary expense.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddSalary(false)}>Cancel</Button>
            <Button onClick={handleAddSalary} disabled={salarySaving}>
              {salarySaving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceRent;
