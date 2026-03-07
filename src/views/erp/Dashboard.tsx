"use client";

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cattle } from '@/data/erp/cattle';
import { sales } from '@/data/erp/sales';
import { vaccinations } from '@/data/erp/vaccinations';
import { treatments } from '@/data/erp/treatments';
import { transactions } from '@/data/erp/transactions';
import { getLowStockAlerts } from '@/data/erp/feed';
import StatusBadge from '@/components/erp/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Beef, DollarSign, Syringe, AlertTriangle, Home, Activity } from 'lucide-react';
import { format } from 'date-fns';

const CHART_TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(12px)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  borderTop: '3px solid hsl(120,50%,48%)',
  padding: '12px 16px',
};

const CHART_CURSOR = { fill: 'rgba(61,184,61,0.06)' };

const revenueData = [
  { month: 'Sep', revenue: 320000, expenses: 280000 },
  { month: 'Oct', revenue: 450000, expenses: 520000 },
  { month: 'Nov', revenue: 890000, expenses: 620000 },
  { month: 'Dec', revenue: 520000, expenses: 380000 },
  { month: 'Jan', revenue: 410000, expenses: 985300 },
  { month: 'Feb', revenue: 1410000, expenses: 774150 },
];

const weightTrend = [
  { day: 'W1', avg: 310 }, { day: 'W2', avg: 318 }, { day: 'W3', avg: 325 },
  { day: 'W4', avg: 332 },
];

type StatCategory = 'animals' | 'finance' | 'health' | 'alert' | 'rent';

const categoryConfig: Record<StatCategory, { icon: React.ElementType; bg: string; color: string; border: string }> = {
  animals: { icon: Beef, bg: 'bg-sw-green-100', color: 'text-primary', border: 'border-l-[3px] border-l-primary' },
  finance: { icon: DollarSign, bg: 'bg-amber-100', color: 'text-amber-600', border: 'border-l-[3px] border-l-sw-gold-400' },
  health: { icon: Syringe, bg: 'bg-sky-100', color: 'text-sky-600', border: 'border-l-[3px] border-l-sw-sky-400' },
  alert: { icon: AlertTriangle, bg: 'bg-red-100', color: 'text-destructive', border: 'border-l-[3px] border-l-destructive' },
  rent: { icon: Home, bg: 'bg-emerald-100', color: 'text-sw-green-700', border: 'border-l-[3px] border-l-sw-green-700' },
};

const StatCard = ({ title, value, sub, category = 'animals', index = 0 }: { title: string; value: string | number; sub?: string; category?: StatCategory; index?: number }) => {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const staggerClass = `erp-stagger-${Math.min(index + 1, 7)}`;
  return (
    <div className={`erp-glass-card rounded-xl ${config.border} group cursor-default ${staggerClass}`}>
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

const WelcomeBanner = () => {
  const { currentUser, currentFarm, currentStation } = useAuth();
  return (
    <div className="sw-gradient-hero rounded-xl p-6 mb-6 text-white relative overflow-hidden erp-slide-up">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
      <div className="relative z-10">
        <h2 className="text-xl font-bold">Welcome back, {currentUser?.fullName || 'User'}</h2>
        <p className="text-white/70 text-sm mt-1">
          {currentFarm?.name || 'GRASS Farms'} · {currentStation?.name || 'All Stations'} · {format(new Date(), 'EEEE, d MMMM yyyy')}
        </p>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
};

// Inline defs - used directly inside each chart, not as a component

const PIE_GRADIENTS = [
  { id: 'pieGreen', from: '#3db83d', to: '#1f9e1f' },
  { id: 'pieGold', from: '#f5d87a', to: '#d4a934' },
  { id: 'pieSky', from: '#4dc8e8', to: '#2a9ec0' },
  { id: 'piePurple', from: '#8b5cf6', to: '#6d28d9' },
  { id: 'pieOrange', from: '#f97316', to: '#c2410c' },
  { id: 'pieRed', from: '#e85858', to: '#b91c1c' },
];

// Inline pie defs - used directly inside each PieChart

const AdminDashboard = () => {
  const totalAnimals = cattle.length;
  const activeListings = cattle.filter(c => c.status === 'Listed').length;
  const upcomingVax = vaccinations.filter(v => v.status === 'Upcoming' || v.status === 'Overdue').length;
  const lowFeedAlerts = getLowStockAlerts();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Animals" value={totalAnimals} sub="45 + 32 + 28" category="animals" index={0} />
        <StatCard title="Active Listings" value={activeListings} category="animals" index={1} />
        <StatCard title="Monthly P/L" value="+PKR 1,240,000" category="finance" index={2} />
        <StatCard title="Upcoming Vaccinations" value={upcomingVax} category="health" index={3} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Rent Status" value="2 Rented, 1 Owned" sub="1 Paid, 1 Overdue" category="rent" index={4} />
        <StatCard title="Low Feed Alerts" value={`${lowFeedAlerts.length} items flagged`} sub={lowFeedAlerts.filter(a => a.severity === 'red').length + ' critical'} category="alert" index={5} />
        <StatCard title="Recent Sales" value={sales.length} category="finance" index={6} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-5">
          <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Weight Growth Trend</p></div>
          <div className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weightTrend}>
                <defs>
                  <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3db83d" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3db83d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} />
                <Area type="monotone" dataKey="avg" stroke="#3db83d" strokeWidth={3} fill="url(#greenArea)" dot={{ r: 5, fill: '#3db83d', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#1f9e1f', stroke: '#fff', strokeWidth: 3 }} animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-6">
          <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Revenue vs Expenses</p></div>
          <div className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
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
                <YAxis fontSize={12} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} />
                <Bar dataKey="revenue" fill="url(#greenBar)" radius={[8, 8, 0, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
                <Bar dataKey="expenses" fill="url(#goldBar)" radius={[8, 8, 0, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="erp-glass-card-subtle rounded-xl erp-stagger-7">
        <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Recent Sales</p></div>
        <div className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead><TableHead className="text-right">Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {sales.slice(0, 3).map(s => (
                <TableRow key={s.id} className="erp-table-row">
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell><StatusBadge status={s.type} /></TableCell>
                  <TableCell>{s.animals}</TableCell>
                  <TableCell className="text-right font-medium">PKR {s.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const VetDashboard = () => {
  const activeTreatments = treatments.filter(t => t.outcome === 'Ongoing');
  const overdueVax = vaccinations.filter(v => v.status === 'Overdue');
  const upcomingVax = vaccinations.filter(v => v.status === 'Upcoming');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Treatments" value={activeTreatments.length} category="health" index={0} />
        <StatCard title="Overdue Vaccinations" value={overdueVax.length} category="alert" index={1} />
        <StatCard title="Upcoming Vaccinations" value={upcomingVax.length} category="health" index={2} />
        <StatCard title="Recently Treated" value={treatments.length} category="health" index={3} />
      </div>
      <div className="erp-glass-card-subtle rounded-xl erp-stagger-5">
        <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Active Treatments</p></div>
        <div className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Cattle</TableHead><TableHead>Condition</TableHead><TableHead>Treatment</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {activeTreatments.map(t => (
                <TableRow key={t.id} className="erp-table-row">
                  <TableCell className="font-mono text-xs">{t.cattleId}</TableCell>
                  <TableCell>{t.condition}</TableCell>
                  <TableCell>{t.treatment}</TableCell>
                  <TableCell><StatusBadge status={t.outcome} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const AccountsDashboard = () => {
  const expenseCategories = [
    { name: 'Cattle Purchase', value: 1587850 },
    { name: 'Feed', value: 35000 },
    { name: 'Medical', value: 1500 },
    { name: 'Salary', value: 90000 },
    { name: 'Rent', value: 45000 },
    { name: 'Marketplace', value: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Monthly P/L" value="+PKR 1,240,000" category="finance" index={0} />
        <StatCard title="Total Income" value="PKR 1,820,000" category="finance" index={1} />
        <StatCard title="Total Expenses" value="PKR 580,000" category="alert" index={2} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-4">
          <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Top Expense Categories</p></div>
          <div className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <defs>
                  {PIE_GRADIENTS.map(g => (
                    <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={g.from} stopOpacity={1} />
                      <stop offset="100%" stopColor={g.to} stopOpacity={0.85} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} cornerRadius={6} stroke="#fff" strokeWidth={3} label={({ name }) => name} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.12))' }}>
                  {expenseCategories.map((_, i) => <Cell key={i} fill={`url(#${PIE_GRADIENTS[i % PIE_GRADIENTS.length].id})`} />)}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="erp-glass-card-subtle rounded-xl erp-stagger-5">
          <div className="p-4 pb-2"><p className="text-base font-semibold text-foreground">Income vs Expenses (6 Months)</p></div>
          <div className="p-4 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
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
                <YAxis fontSize={12} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} />
                <Bar dataKey="revenue" fill="url(#greenBar2)" radius={[8, 8, 0, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
                <Bar dataKey="expenses" fill="url(#goldBar2)" radius={[8, 8, 0, 0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="erp-glass-card-subtle rounded-xl erp-stagger-6">
        <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Recent Transactions</p></div>
        <div className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map(t => (
                <TableRow key={t.id} className="erp-table-row">
                  <TableCell>{t.date}</TableCell>
                  <TableCell><StatusBadge status={t.type === 'Income' ? 'Paid' : 'Unpaid'} /></TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell className="text-xs">{t.description}</TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'Income' ? 'text-sw-green-700' : 'text-destructive'}`}>
                    {t.type === 'Income' ? '+' : '-'}PKR {t.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const WorkerDashboard = () => (
  <div className="space-y-6">
    <div className="erp-glass-card-subtle rounded-xl erp-stagger-1">
      <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Today&apos;s Tasks</p></div>
      <div className="px-4 pb-4 space-y-2">
        {['Log weight for F001-0001', 'Log weight for F001-0007', 'Record feed for Station A', 'Check water troughs Station A'].map((task, i) => (
          <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-primary/5 p-2.5 rounded-lg transition-all duration-200 hover:translate-x-1">
            <input type="checkbox" className="rounded border-input accent-primary h-4 w-4" />
            <span>{task}</span>
          </label>
        ))}
      </div>
    </div>
    <div className="erp-glass-card-subtle rounded-xl erp-stagger-2">
      <div className="p-4 pb-3"><p className="text-base font-semibold text-foreground">Assigned Animals</p></div>
      <div className="px-4 pb-4">
        <div className="flex flex-wrap gap-2">
          {cattle.filter(c => c.station === 'Station 1 — Main' && c.status !== 'Sold' && c.status !== 'Dead' && c.status !== 'Slaughtered').map(c => (
            <span key={c.id} className="px-2.5 py-1.5 bg-primary/10 text-sw-green-900 rounded-lg text-xs font-mono font-medium hover:bg-primary/20 transition-colors duration-200 cursor-default">{c.id}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ManagerDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Station Animals" value={45} category="animals" index={0} />
      <StatCard title="Active" value={cattle.filter(c => c.status === 'Active').length} category="animals" index={1} />
      <StatCard title="Recent Purchases" value="3" category="finance" index={2} />
      <StatCard title="Feed Stock" value="OK" sub="All items above threshold" category="health" index={3} />
    </div>
    <AdminDashboard />
  </div>
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const role = currentUser?.role || 'Admin';

  const dashboards: Record<string, React.ReactNode> = {
    'Admin': <AdminDashboard />,
    'Manager': <ManagerDashboard />,
    'Veterinarian': <VetDashboard />,
    'Accounts Officer': <AccountsDashboard />,
    'Worker': <WorkerDashboard />,
  };

  return (
    <div>
      <WelcomeBanner />
      {dashboards[role] || <AdminDashboard />}
    </div>
  );
};

export default Dashboard;
