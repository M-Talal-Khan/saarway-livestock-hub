"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/erp/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_TOOLTIP_STYLE = {
  background: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderTop: '3px solid hsl(120,50%,48%)', padding: '12px 16px',
};
const CHART_CURSOR = { fill: 'rgba(61,184,61,0.06)' };
const PIE_COLORS = ['#3db83d', '#e8c24a', '#4dc8e8', '#8b5cf6', '#9ca3af', '#e85858'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface CattleRow { id: string; status: string; breed: string; teeth: number; current_weight: number; gender: string; purchase_date: string; purchase_price: number; station_id: string; stations: { station_name: string } | null; }
interface SaleRow { id: string; sale_type: string; sale_date: string; total_price: number; buyer_name: string | null; sale_items: unknown[]; station_id: string; stations: { station_name: string } | null; }
interface VacRow { id: string; status: string; vaccine_name: string; cattle: { cattle_code: string } | null; }
interface TreatRow { id: string; outcome: string | null; cattle: { cattle_code: string } | null; }
interface TxnRow { id: string; type: string; category: string; amount: number; description: string | null; transaction_date: string; stations: { station_name: string } | null; }
interface RentRow { id: string; rent_amount: number; rental_cycle: string; contract_start: string | null; contract_end: string | null; owner_name: string; payment_status: string; stations: { station_name: string; station_tag: string } | null; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const downloadCSV = (rows: Record<string, unknown>[], filename: string) => {
  if (!rows.length) { toast({ title: 'No data to export' }); return; }
  const headers = Object.keys(rows[0]).join(',');
  const body = rows.map(r => Object.values(r).map(v => `"${v ?? ''}"`).join(',')).join('\n');
  const blob = new Blob([headers + '\n' + body], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Exported', description: `${filename}.csv downloaded` });
};

// ── Component ─────────────────────────────────────────────────────────────────

const Reports = () => {
  const { currentUser, currentStation } = useAuth();
  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? '';
  const canFinance = ['Admin', 'Accounts Officer'].includes(role);
  const canSales = ['Admin', 'Manager', 'Accounts Officer'].includes(role);
  const canHealth = ['Admin', 'Manager', 'Veterinarian'].includes(role);
  const isAdmin = role === 'Admin';

  const [cattle, setCattle] = useState<CattleRow[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [vaccinations, setVaccinations] = useState<VacRow[]>([]);
  const [treatments, setTreatments] = useState<TreatRow[]>([]);
  const [transactions, setTransactions] = useState<TxnRow[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, pl: 0 });
  const [rentDetails, setRentDetails] = useState<RentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const promises: Promise<Response>[] = [
        fetch('/api/erp/cattle', { headers }),
        fetch('/api/erp/sales', { headers }),
        fetch('/api/erp/health/vaccinations', { headers }),
        fetch('/api/erp/health/treatments', { headers }),
      ];
      if (canFinance) {
        promises.push(fetch('/api/erp/finance?months=12', { headers }));
        promises.push(fetch('/api/erp/finance/rent', { headers }));
      }
      const responses = await Promise.all(promises);
      const jsons = await Promise.all(responses.map(r => r.json()));
      setCattle(jsons[0].cattle ?? []);
      setSales(jsons[1].sales ?? []);
      setVaccinations(jsons[2].vaccinations ?? []);
      setTreatments(jsons[3].treatments ?? []);
      if (canFinance) {
        setTransactions(jsons[4].transactions ?? []);
        setSummary(jsons[4].summary ?? { income: 0, expenses: 0, pl: 0 });
        setRentDetails(jsons[5].rentDetails ?? []);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load reports', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [token, canFinance]);

  useEffect(() => { if (token) fetchAll(); }, [token, fetchAll]);

  // ── Station-scoped data (non-Admin sees own station only) ─────────────────

  const filteredCattle = useMemo(() => {
    if (isAdmin || !currentStation?.id) return cattle;
    return cattle.filter(c => c.station_id === currentStation.id);
  }, [cattle, isAdmin, currentStation?.id]);

  const filteredSales = useMemo(() => {
    if (isAdmin || !currentStation?.id) return sales;
    return sales.filter(s => s.station_id === currentStation.id);
  }, [sales, isAdmin, currentStation?.id]);

  const filteredCattleCodes = useMemo(() => new Set(filteredCattle.map(c => (c as unknown as { cattle_code?: string }).cattle_code ?? c.id)), [filteredCattle]);

  const filteredVaccinations = useMemo(() => {
    if (isAdmin || !currentStation?.id) return vaccinations;
    return vaccinations.filter(v => v.cattle?.cattle_code && filteredCattleCodes.has(v.cattle.cattle_code));
  }, [vaccinations, isAdmin, currentStation?.id, filteredCattleCodes]);

  const filteredTreatments = useMemo(() => {
    if (isAdmin || !currentStation?.id) return treatments;
    return treatments.filter(t => t.cattle?.cattle_code && filteredCattleCodes.has(t.cattle.cattle_code));
  }, [treatments, isAdmin, currentStation?.id, filteredCattleCodes]);

  // ── Charts ─────────────────────────────────────────────────────────────────

  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredCattle.forEach(c => map.set(c.status, (map.get(c.status) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [filteredCattle]);

  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    filteredSales.forEach(s => {
      const mo = s.sale_date.slice(0, 7);
      map.set(mo, (map.get(mo) ?? 0) + s.total_price);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month: new Date(month + '-01').toLocaleDateString('en-PK', { month: 'short' }), revenue }));
  }, [filteredSales]);

  const overdueVac = filteredVaccinations.filter(v => v.status === 'overdue').length;
  const completedVac = filteredVaccinations.filter(v => v.status === 'completed').length;
  const totalVac = filteredVaccinations.length;
  const compliancePct = totalVac > 0 ? Math.round((completedVac / totalVac) * 100) : 0;
  const activeTreat = filteredTreatments.filter(t => !t.outcome || t.outcome === 'ongoing').length;

  // ── CSV exports ────────────────────────────────────────────────────────────

  const exportCattle = () => downloadCSV(filteredCattle.map(c => ({
    code: (c as unknown as { cattle_code?: string }).cattle_code ?? c.id,
    breed: c.breed, teeth: c.teeth, weight: c.current_weight, gender: c.gender,
    status: c.status, station: c.stations?.station_name ?? '', purchase_date: c.purchase_date, purchase_price: c.purchase_price,
  })), 'cattle-report');

  const exportSales = () => downloadCSV(filteredSales.map(s => ({
    date: s.sale_date, type: s.sale_type, animals: s.sale_items.length,
    buyer: s.buyer_name ?? '', station: s.stations?.station_name ?? '', total: s.total_price,
  })), 'sales-report');

  const exportFinance = () => downloadCSV(transactions.map(t => ({
    date: t.transaction_date, type: t.type, category: t.category,
    amount: t.amount, description: t.description ?? '', station: t.stations?.station_name ?? '',
  })), 'finance-report');

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground erp-slide-up">Reports</h1>

      <Tabs defaultValue={role === 'Veterinarian' ? 'health' : 'cattle'}>
        <TabsList>
          <TabsTrigger value="cattle">Cattle</TabsTrigger>
          {canSales && <TabsTrigger value="sales">Sales</TabsTrigger>}
          {canHealth && <TabsTrigger value="health">Health</TabsTrigger>}
          {canFinance && <TabsTrigger value="finance">Finance</TabsTrigger>}
          {canFinance && <TabsTrigger value="rent">Rent</TabsTrigger>}
        </TabsList>

        {/* ── Cattle ────────────────────────────────────────────────────────── */}
        <TabsContent value="cattle" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCattle}><Download className="h-4 w-4" />Export CSV</Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusBreakdown.length > 0 && (
              <Card className="erp-glass-card-subtle">
                <CardHeader className="pb-2"><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} cornerRadius={5} stroke="#fff" strokeWidth={2} label={({ name }) => name} animationDuration={1200}>
                        {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
            <Card className="erp-glass-card-subtle">
              <CardHeader className="pb-2"><CardTitle className="text-base">Summary</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-2">
                {[
                  { label: 'Total Active', value: filteredCattle.filter(c => !['sold', 'slaughtered', 'dead'].includes(c.status)).length },
                  { label: 'Ready for Sale', value: filteredCattle.filter(c => c.status === 'ready_for_sale').length },
                  { label: 'Currently Listed', value: filteredCattle.filter(c => c.status === 'listed').length },
                  { label: 'Sold', value: filteredCattle.filter(c => c.status === 'sold').length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Sales ─────────────────────────────────────────────────────────── */}
        {canSales && <TabsContent value="sales" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={exportSales}><Download className="h-4 w-4" />Export CSV</Button>
          </div>
          {monthlyRevenue.length > 0 && (
            <Card className="erp-glass-card-subtle">
              <CardHeader className="pb-2"><CardTitle className="text-base">Revenue by Period</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="rGreenBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ad88a" /><stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                    <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} formatter={(v: number) => [`PKR ${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="url(#rGreenBar)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead>
                  <TableHead>Buyer</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Total</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No sales recorded yet.</TableCell></TableRow>
                  ) : filteredSales.map(s => (
                    <TableRow key={s.id} className="erp-table-row">
                      <TableCell>{s.sale_date}</TableCell>
                      <TableCell><StatusBadge status={s.sale_type} /></TableCell>
                      <TableCell>{s.sale_items.length}</TableCell>
                      <TableCell className="text-sm">{s.buyer_name ?? '—'}</TableCell>
                      <TableCell className="text-xs">{s.stations?.station_name ?? '—'}</TableCell>
                      <TableCell className="text-right font-medium">PKR {s.total_price.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>}

        {/* ── Health ────────────────────────────────────────────────────────── */}
        {canHealth && <TabsContent value="health">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Vaccination Compliance', value: `${compliancePct}%`, color: 'text-primary', border: 'border-l-[3px] border-l-primary' },
              { label: 'Overdue Vaccinations', value: String(overdueVac), color: 'text-destructive', border: 'border-l-[3px] border-l-destructive' },
              { label: 'Active Treatments', value: String(activeTreat), color: 'text-sw-gold-400', border: 'border-l-[3px] border-l-sw-gold-400' },
            ].map(s => (
              <Card key={s.label} className={`${s.border} erp-glass-card`}>
                <CardContent className="p-5 text-center">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>}

        {/* ── Finance ───────────────────────────────────────────────────────── */}
        {canFinance && (
          <TabsContent value="finance" className="space-y-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={exportFinance}><Download className="h-4 w-4" />Export CSV</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Income (12m)', value: `PKR ${summary.income.toLocaleString()}`, color: 'text-sw-green-700', border: 'border-l-[3px] border-l-primary' },
                { label: 'Total Expenses (12m)', value: `PKR ${summary.expenses.toLocaleString()}`, color: 'text-destructive', border: 'border-l-[3px] border-l-destructive' },
                { label: 'Net P/L', value: `${summary.pl >= 0 ? '+' : ''}PKR ${summary.pl.toLocaleString()}`, color: summary.pl >= 0 ? 'text-primary' : 'text-destructive', border: 'border-l-[3px] border-l-sw-gold-400' },
              ].map(s => (
                <Card key={s.label} className={`${s.border} erp-glass-card`}>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {/* ── Rent ──────────────────────────────────────────────────────────── */}
        {canFinance && (
          <TabsContent value="rent">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Station</TableHead><TableHead>Owner</TableHead>
                    <TableHead>Rent</TableHead><TableHead>Status</TableHead><TableHead>Contract</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {rentDetails.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No rent records.</TableCell></TableRow>
                    ) : rentDetails.map(r => (
                      <TableRow key={r.id} className="erp-table-row">
                        <TableCell className="font-medium">{r.stations?.station_name ?? '—'}</TableCell>
                        <TableCell>{r.owner_name}</TableCell>
                        <TableCell>PKR {r.rent_amount.toLocaleString()} / {r.rental_cycle}</TableCell>
                        <TableCell><StatusBadge status={r.payment_status} /></TableCell>
                        <TableCell className="text-xs">{r.contract_start ? `${r.contract_start} → ${r.contract_end ?? ''}` : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Reports;
