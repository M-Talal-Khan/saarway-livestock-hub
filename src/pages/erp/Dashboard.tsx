import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cattle } from '@/data/erp/cattle';
import { sales } from '@/data/erp/sales';
import { vaccinations } from '@/data/erp/vaccinations';
import { treatments } from '@/data/erp/treatments';
import { transactions } from '@/data/erp/transactions';
import { erpStations } from '@/data/erp/erpStations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Beef, DollarSign, Syringe, AlertTriangle, Home, Activity, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

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

const categoryIcons: Record<StatCategory, React.ElementType> = {
  animals: Beef,
  finance: DollarSign,
  health: Syringe,
  alert: AlertTriangle,
  rent: Home,
};

const categoryIconBg: Record<StatCategory, string> = {
  animals: 'bg-sw-green-100 text-primary',
  finance: 'bg-amber-100 text-amber-600',
  health: 'bg-sky-100 text-sky-600',
  alert: 'bg-red-100 text-destructive',
  rent: 'bg-emerald-100 text-sw-green-700',
};

const categoryBorder: Record<StatCategory, string> = {
  animals: 'erp-stat-border-animals',
  finance: 'erp-stat-border-finance',
  health: 'erp-stat-border-health',
  alert: 'erp-stat-border-alert',
  rent: 'erp-stat-border-rent',
};

const StatCard = ({ title, value, sub, category = 'animals' }: { title: string; value: string | number; sub?: string; category?: StatCategory }) => {
  const Icon = categoryIcons[category];
  return (
    <Card className={`${categoryBorder[category]} hover:-translate-y-[2px]`}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${categoryIconBg[category]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-sw-green-900 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

const WelcomeBanner = () => {
  const { currentUser, currentFarm, currentStation } = useAuth();
  return (
    <div className="sw-gradient-hero rounded-xl p-6 mb-6 text-white">
      <h2 className="text-xl font-bold">Welcome back, {currentUser?.fullName || 'User'}</h2>
      <p className="text-white/70 text-sm mt-1">
        {currentFarm?.name || 'GRASS Farms'} · {currentStation?.name || 'All Stations'} · {format(new Date(), 'EEEE, d MMMM yyyy')}
      </p>
    </div>
  );
};

const AdminDashboard = () => {
  const totalAnimals = cattle.length;
  const activeListings = cattle.filter(c => c.status === 'Listed').length;
  const upcomingVax = vaccinations.filter(v => v.status === 'Upcoming' || v.status === 'Overdue').length;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Animals" value={totalAnimals} sub="45 + 32 + 28" category="animals" />
        <StatCard title="Active Listings" value={activeListings} category="animals" />
        <StatCard title="Monthly P/L" value="+PKR 1,240,000" category="finance" />
        <StatCard title="Upcoming Vaccinations" value={upcomingVax} category="health" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Rent Status" value="2 Rented, 1 Owned" sub="1 Paid, 1 Overdue" category="rent" />
        <StatCard title="Low Feed Alerts" value="1 station flagged" category="alert" />
        <StatCard title="Recent Sales" value={sales.length} category="finance" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weight Growth Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.2)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="hsl(120,50%,48%)" strokeWidth={2} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.2)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(120,50%,48%)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                <Bar dataKey="expenses" fill="hsl(44,76%,60%)" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Sales</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead><TableHead className="text-right">Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {sales.slice(0, 3).map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell>{s.date}</TableCell>
                  <TableCell><StatusBadge status={s.type} /></TableCell>
                  <TableCell>{s.animals}</TableCell>
                  <TableCell className="text-right font-medium">PKR {s.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

const VetDashboard = () => {
  const activeTreatments = treatments.filter(t => t.outcome === 'Ongoing');
  const overdueVax = vaccinations.filter(v => v.status === 'Overdue');
  const upcomingVax = vaccinations.filter(v => v.status === 'Upcoming');

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Active Treatments" value={activeTreatments.length} category="health" />
        <StatCard title="Overdue Vaccinations" value={overdueVax.length} category="alert" />
        <StatCard title="Upcoming Vaccinations" value={upcomingVax.length} category="health" />
        <StatCard title="Recently Treated" value={treatments.length} category="health" />
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Active Treatments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Cattle</TableHead><TableHead>Condition</TableHead><TableHead>Treatment</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {activeTreatments.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.cattleId}</TableCell>
                  <TableCell>{t.condition}</TableCell>
                  <TableCell>{t.treatment}</TableCell>
                  <TableCell><StatusBadge status={t.outcome} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

const AccountsDashboard = () => {
  const expenseCategories = [
    { name: 'Cattle Purchase', value: 1587850, color: 'hsl(120,50%,48%)' },
    { name: 'Feed', value: 35000, color: 'hsl(44,76%,60%)' },
    { name: 'Medical', value: 1500, color: 'hsl(0,76%,63%)' },
    { name: 'Salary', value: 90000, color: 'hsl(192,72%,60%)' },
    { name: 'Rent', value: 45000, color: 'hsl(120,67%,37%)' },
    { name: 'Marketplace', value: 100, color: 'hsl(120,50%,90%)' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Monthly P/L" value="+PKR 1,240,000" category="finance" />
        <StatCard title="Total Income" value="PKR 1,820,000" category="finance" />
        <StatCard title="Total Expenses" value="PKR 580,000" category="alert" />
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Expense Categories</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name} animationDuration={1000}>
                  {expenseCategories.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Income vs Expenses (6 Months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.2)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(120,50%,48%)" radius={[4, 4, 0, 0]} animationDuration={1000} />
                <Bar dataKey="expenses" fill="hsl(44,76%,60%)" radius={[4, 4, 0, 0]} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow>
              <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {transactions.slice(0, 5).map(t => (
                <TableRow key={t.id}>
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
        </CardContent>
      </Card>
    </>
  );
};

const WorkerDashboard = () => (
  <>
    <Card className="mb-4">
      <CardHeader className="pb-2"><CardTitle className="text-sm">Today's Tasks</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {['Log weight for F001-0001', 'Log weight for F001-0007', 'Record feed for Station A', 'Check water troughs Station A'].map((task, i) => (
          <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-sw-green-50 p-1 rounded transition-colors">
            <input type="checkbox" className="rounded border-input accent-primary" />
            <span>{task}</span>
          </label>
        ))}
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Assigned Animals</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {cattle.filter(c => c.station === 'Station 1 — Main' && c.status !== 'Sold' && c.status !== 'Dead' && c.status !== 'Slaughtered').map(c => (
            <span key={c.id} className="px-2 py-1 bg-sw-green-100 text-sw-green-900 rounded-lg text-xs font-mono">{c.id}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  </>
);

const ManagerDashboard = () => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Station Animals" value={45} category="animals" />
      <StatCard title="Active" value={cattle.filter(c => c.status === 'Active').length} category="animals" />
      <StatCard title="Recent Purchases" value="3" category="finance" />
      <StatCard title="Feed Stock" value="OK" sub="All items above threshold" category="health" />
    </div>
    <AdminDashboard />
  </>
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
