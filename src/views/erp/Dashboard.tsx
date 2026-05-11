"use client";

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/erp/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Beef, DollarSign, Syringe, AlertTriangle, Home, Loader2, ClipboardList } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// ── Chart styles ─────────────────────────────────────────────────────────────
const CHART_TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
  border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  borderTop: '3px solid hsl(120,50%,48%)', padding: '12px 16px',
};
const CHART_CURSOR = { fill: 'rgba(61,184,61,0.06)' };
const PIE_GRADIENTS = [
  { id: 'pieGreen', from: '#3db83d', to: '#1f9e1f' },
  { id: 'pieGold', from: '#f5d87a', to: '#d4a934' },
  { id: 'pieSky', from: '#4dc8e8', to: '#2a9ec0' },
  { id: 'piePurple', from: '#8b5cf6', to: '#6d28d9' },
  { id: 'pieOrange', from: '#f97316', to: '#c2410c' },
  { id: 'pieRed', from: '#e85858', to: '#b91c1c' },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  cattle: { total: number; readyForSale: number; listed: number };
  health: {
    overdueVaccinations: number;
    upcomingVaccinations: number;
    activeTreatments: number;
    recentTreatments: { id: string; condition_name: string; treatment_given: string; outcome: string | null; cattle: { cattle_code: string; breed: string } | null }[];
    upcomingVaccinationsList: { id: string; vaccine_name: string; next_due_date: string; cattle: { cattle_code: string } | null }[];
  };
  finance: { income: number; expenses: number; pl: number };
  alerts: {
    lowFeed: { id: string; name: string; current_stock: number; low_stock_threshold: number; unit: string; stations: { station_name: string } | null }[];
    overdueRent: { id: string; owner_name: string; rent_amount: number; stations: { station_name: string } | null }[];
  };
  rent: { id: string; payment_status: string; stations: { station_name: string } | null }[];
  recentSales: { id: string; sale_type: string; total_price: number; sale_date: string; buyer_name: string | null }[];
  workerCattle: { id: string; cattle_code: string; breed: string; status: string; current_weight: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
type StatCategory = 'animals' | 'finance' | 'health' | 'alert' | 'rent';
const categoryConfig: Record<StatCategory, { icon: React.ElementType; bg: string; color: string; border: string }> = {
  animals: { icon: Beef, bg: 'bg-sw-green-100', color: 'text-primary', border: 'border-l-[3px] border-l-primary' },
  finance: { icon: DollarSign, bg: 'bg-amber-100', color: 'text-amber-600', border: 'border-l-[3px] border-l-sw-gold-400' },
  health: { icon: Syringe, bg: 'bg-sky-100', color: 'text-sky-600', border: 'border-l-[3px] border-l-sky-400' },
  alert: { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-destructive', border: 'border-l-[3px] border-l-destructive' },
  rent: { icon: Home, bg: 'bg-emerald-100', color: 'text-sw-green-700', border: 'border-l-[3px] border-l-sw-green-700' },
};

const StatCard = ({ title, value, sub, category = 'animals', index = 0 }: {
  title: string; value: string | number; sub?: string; category?: StatCategory; index?: number;
}) => {
  const config = categoryConfig[category];
  const Icon = config.icon;
  return (
    <div className={`erp-glass-card rounded-xl ${config.border} group cursor-default erp-stagger-${Math.min(index + 1, 7)}`}>
      <div className="p-5 flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
};

const fmt = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;
const fmtSign = (n: number) => `${n >= 0 ? '+' : ''}PKR ${Math.round(Math.abs(n)).toLocaleString()}`;

// Build monthly revenue/expense chart data from transactions
function buildMonthlyChart(transactions: { type: string; amount: number; transaction_date: string }[]) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { label: format(d, 'MMM'), start: startOfMonth(d).toISOString().split('T')[0], end: endOfMonth(d).toISOString().split('T')[0] };
  });
  return months.map((m) => {
    const inRange = transactions.filter((t) => t.transaction_date >= m.start && t.transaction_date <= m.end);
    return {
      month: m.label,
      revenue: inRange.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expenses: inRange.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });
}

// Build pie from transactions
function buildExpensePie(transactions: { type: string; amount: number; category: string }[]) {
  const catMap: Record<string, number> = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    const label = t.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    catMap[label] = (catMap[label] ?? 0) + t.amount;
  });
  return Object.entries(catMap).map(([name, value]) => ({ name, value }));
}

// ── WelcomeBanner ─────────────────────────────────────────────────────────────
const WelcomeBanner = () => {
  const { currentUser, currentFarm, currentStation } = useAuth();
  return (
    <div className="sw-gradient-hero rounded-xl p-6 mb-6 text-white relative overflow-hidden erp-slide-up">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold">Welcome back, {currentUser?.fullName || 'User'}</h2>
        <p className="text-white/70 text-sm mt-1">
          {currentFarm?.name} · {currentStation?.name || 'All Stations'} · {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
};

// ── AdminManagerDashboard ─────────────────────────────────────────────────────
const AdminManagerDashboard = ({ data, transactions }: { data: DashboardData; transactions: { type: string; amount: number; transaction_date: string; category: string }[] }) => {
  const chartData = buildMonthlyChart(transactions);
  const overdueRentCount = data.rent.filter((r) => r.payment_status === 'overdue').length;
  const paidRentCount = data.rent.filter((r) => r.payment_status === 'paid').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Animals" value={data.cattle.total} category="animals" index={0} />
        <StatCard title="Active Listings" value={data.cattle.listed} category="animals" index={1} />
        <StatCard title="Monthly P/L" value={fmtSign(data.finance.pl)} category="finance" index={2} />
        <StatCard title="Vaccination Alerts" value={data.health.overdueVaccinations + data.health.upcomingVaccinations} sub={`${data.health.overdueVaccinations} overdue`} category="health" index={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Rent Status" value={`${data.rent.length} Station${data.rent.length !== 1 ? 's' : ''}`} sub={`${paidRentCount} paid · ${overdueRentCount} overdue`} category="rent" index={4} />
        <StatCard title="Low Feed Alerts" value={data.alerts.lowFeed.length === 0 ? 'All OK' : `${data.alerts.lowFeed.length} flagged`} category={data.alerts.lowFeed.length > 0 ? 'alert' : 'health'} index={5} />
        <StatCard title="Recent Sales" value={data.recentSales.length} sub={data.recentSales.length > 0 ? fmt(data.recentSales.reduce((s, r) => s + r.total_price, 0)) + ' total' : ''} category="finance" index={6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-5">
          <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Revenue vs Expenses (6 Months)</p></div>
          <div className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="greenBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ad88a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5d87a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d4a934" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="revenue" name="Revenue" fill="url(#greenBar)" radius={[8, 8, 0, 0]} animationDuration={1200} />
                <Bar dataKey="expenses" name="Expenses" fill="url(#goldBar)" radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data.alerts.lowFeed.length > 0 && (
          <div className="erp-glass-card-subtle rounded-xl erp-stagger-6">
            <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Low Feed Alerts</p></div>
            <div className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Feed</TableHead><TableHead>Station</TableHead><TableHead>Stock</TableHead><TableHead>Threshold</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {data.alerts.lowFeed.map((f) => (
                    <TableRow key={f.id} className="erp-table-row">
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.stations?.station_name ?? '—'}</TableCell>
                      <TableCell className="text-destructive font-medium">{f.current_stock} {f.unit}</TableCell>
                      <TableCell className="text-muted-foreground">{f.low_stock_threshold} {f.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {data.recentSales.length > 0 && (
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-7">
          <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Recent Sales</p></div>
          <div className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Buyer</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {data.recentSales.map((s) => (
                  <TableRow key={s.id} className="erp-table-row">
                    <TableCell>{s.sale_date}</TableCell>
                    <TableCell><StatusBadge status={s.sale_type === 'live' ? 'Live Sale' : 'Slaughter'} /></TableCell>
                    <TableCell>{s.buyer_name ?? '—'}</TableCell>
                    <TableCell className="text-right font-medium text-sw-green-700">{fmt(s.total_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── VetDashboard ──────────────────────────────────────────────────────────────
const VetDashboard = ({ data }: { data: DashboardData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Active Treatments" value={data.health.activeTreatments} category="health" index={0} />
      <StatCard title="Overdue Vaccinations" value={data.health.overdueVaccinations} category="alert" index={1} />
      <StatCard title="Upcoming Vaccinations" value={data.health.upcomingVaccinations} category="health" index={2} />
      <StatCard title="Total Animals" value={data.cattle.total} category="animals" index={3} />
    </div>

    {data.health.recentTreatments.length > 0 && (
      <div className="erp-glass-card-subtle rounded-xl erp-stagger-5">
        <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Active Treatments</p></div>
        <div className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Cattle</TableHead><TableHead>Condition</TableHead><TableHead>Treatment</TableHead><TableHead>Outcome</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {data.health.recentTreatments.map((t) => (
                <TableRow key={t.id} className="erp-table-row">
                  <TableCell className="font-mono text-xs">{t.cattle?.cattle_code ?? '—'}</TableCell>
                  <TableCell>{t.condition_name}</TableCell>
                  <TableCell>{t.treatment_given}</TableCell>
                  <TableCell><StatusBadge status={t.outcome ?? 'Ongoing'} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )}

    {data.health.upcomingVaccinationsList.length > 0 && (
      <div className="erp-glass-card-subtle rounded-xl erp-stagger-6">
        <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Upcoming Vaccinations</p></div>
        <div className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Cattle</TableHead><TableHead>Vaccine</TableHead><TableHead>Due Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {data.health.upcomingVaccinationsList.map((v) => (
                <TableRow key={v.id} className="erp-table-row">
                  <TableCell className="font-mono text-xs">{v.cattle?.cattle_code ?? '—'}</TableCell>
                  <TableCell>{v.vaccine_name}</TableCell>
                  <TableCell>{v.next_due_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )}
  </div>
);

// ── AccountsDashboard ─────────────────────────────────────────────────────────
const AccountsDashboard = ({ data, transactions }: { data: DashboardData; transactions: { type: string; amount: number; transaction_date: string; category: string }[] }) => {
  const chartData = buildMonthlyChart(transactions);
  const expensePie = buildExpensePie(transactions);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="6-Month P/L" value={fmtSign(data.finance.pl)} category="finance" index={0} />
        <StatCard title="Total Income" value={fmt(data.finance.income)} category="finance" index={1} />
        <StatCard title="Total Expenses" value={fmt(data.finance.expenses)} category="alert" index={2} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {expensePie.length > 0 && (
          <div className="erp-glass-card-subtle rounded-xl erp-stagger-4">
            <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Top Expense Categories</p></div>
            <div className="p-4 pt-0">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <defs>
                    {PIE_GRADIENTS.map((g) => (
                      <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={g.from} stopOpacity={1} />
                        <stop offset="100%" stopColor={g.to} stopOpacity={0.85} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} cornerRadius={6} stroke="#fff" strokeWidth={3} animationDuration={1200}>
                    {expensePie.map((_, i) => <Cell key={i} fill={`url(#${PIE_GRADIENTS[i % PIE_GRADIENTS.length].id})`} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-5">
          <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Income vs Expenses (6 Months)</p></div>
          <div className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="greenBar2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ad88a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="goldBar2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5d87a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d4a934" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="revenue" name="Income" fill="url(#greenBar2)" radius={[8, 8, 0, 0]} animationDuration={1200} />
                <Bar dataKey="expenses" name="Expenses" fill="url(#goldBar2)" radius={[8, 8, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── WorkerDashboard ───────────────────────────────────────────────────────────
const WorkerDashboard = ({ data }: { data: DashboardData }) => (
  <div className="space-y-6">
    <div className="erp-glass-card-subtle rounded-xl erp-stagger-1">
      <div className="p-4 pb-3 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-muted-foreground" />
        <p className="text-base font-semibold text-foreground">Tasks</p>
      </div>
      <div className="px-4 pb-4">
        <p className="text-sm text-muted-foreground">Task assignment is coming soon. Check with your manager for daily instructions.</p>
      </div>
    </div>
    <div className="erp-glass-card-subtle rounded-xl erp-stagger-2">
      <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Assigned Animals ({data.workerCattle.length})</p></div>
      <div className="px-4 pb-4">
        {data.workerCattle.length === 0 ? (
          <p className="text-sm text-muted-foreground">No animals assigned to your station.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.workerCattle.map((c) => (
              <span key={c.id} className="px-2.5 py-1.5 bg-primary/10 text-sw-green-900 rounded-lg text-xs font-mono font-medium hover:bg-primary/20 transition-colors cursor-default">
                {c.cattle_code} · {c.breed} · {c.current_weight}kg
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [transactions, setTransactions] = useState<{ type: string; amount: number; transaction_date: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const token = currentUser?.sessionToken ?? '';
  const role = currentUser?.role ?? 'Admin';

  const fetchDashboard = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    // Fetch dashboard data (includes cattle, health, finance summary)
    const dashRes = await fetch('/api/erp/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    const dashData = await dashRes.json();
    if (dashRes.ok) setData(dashData);

    // Fetch finance transactions for charts (Admin, Manager, Accounts Officer)
    if (['Admin', 'Manager', 'Accounts Officer'].includes(role)) {
      const finRes = await fetch('/api/erp/finance', { headers: { Authorization: `Bearer ${token}` } });
      if (finRes.ok) {
        const finData = await finRes.json();
        setTransactions(finData.transactions ?? []);
      }
    }

    setLoading(false);
  }, [token, role]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading || !data) {
    return (
      <div>
        <WelcomeBanner />
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading dashboard...
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (role) {
      case 'Admin':
      case 'Manager':
        return <AdminManagerDashboard data={data} transactions={transactions} />;
      case 'Veterinarian':
        return <VetDashboard data={data} />;
      case 'Accounts Officer':
        return <AccountsDashboard data={data} transactions={transactions} />;
      case 'Worker':
        return <WorkerDashboard data={data} />;
      default:
        return <AdminManagerDashboard data={data} transactions={transactions} />;
    }
  };

  return (
    <div>
      <WelcomeBanner />
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
