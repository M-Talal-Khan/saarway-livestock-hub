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

const statusBreakdown = [
  { name: 'Active', value: 5, color: '#3B82F6' },
  { name: 'Fattening', value: 3, color: '#F97316' },
  { name: 'Ready for Sale', value: 2, color: '#3db83d' },
  { name: 'Listed', value: 2, color: '#8B5CF6' },
  { name: 'Sold', value: 1, color: '#6B7280' },
  { name: 'Slaughtered', value: 1, color: '#991B1B' },
  { name: 'Dead', value: 1, color: '#111827' },
];

const StatCard = ({ title, value, sub }: { title: string; value: string | number; sub?: string }) => (
  <Card>
    <CardContent className="p-4">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const totalAnimals = cattle.length;
  const activeListings = cattle.filter(c => c.status === 'Listed').length;
  const upcomingVax = vaccinations.filter(v => v.status === 'Upcoming' || v.status === 'Overdue').length;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Animals" value={totalAnimals} sub="45 + 32 + 28" />
        <StatCard title="Active Listings" value={activeListings} />
        <StatCard title="Monthly P/L" value="+PKR 1,240,000" />
        <StatCard title="Upcoming Vaccinations" value={upcomingVax} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Rent Status" value="2 Rented, 1 Owned" sub="1 Paid, 1 Overdue" />
        <StatCard title="Low Feed Alerts" value="1 station flagged" />
        <StatCard title="Recent Sales" value={sales.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weight Growth Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#F97316" radius={[4, 4, 0, 0]} />
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
        <StatCard title="Active Treatments" value={activeTreatments.length} />
        <StatCard title="Overdue Vaccinations" value={overdueVax.length} />
        <StatCard title="Upcoming Vaccinations" value={upcomingVax.length} />
        <StatCard title="Recently Treated" value={treatments.length} />
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
    { name: 'Cattle Purchase', value: 1587850, color: '#3B82F6' },
    { name: 'Feed', value: 35000, color: '#F97316' },
    { name: 'Medical', value: 1500, color: '#EF4444' },
    { name: 'Salary', value: 90000, color: '#8B5CF6' },
    { name: 'Rent', value: 45000, color: '#6B7280' },
    { name: 'Marketplace', value: 100, color: '#14B8A6' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Monthly P/L" value="+PKR 1,240,000" />
        <StatCard title="Total Income" value="PKR 1,820,000" />
        <StatCard title="Total Expenses" value="PKR 580,000" />
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Expense Categories</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#F97316" radius={[4, 4, 0, 0]} />
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
                  <TableCell className={`text-right font-medium ${t.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
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
          <label key={i} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" />
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
            <span key={c.id} className="px-2 py-1 bg-muted rounded text-xs font-mono">{c.id}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  </>
);

const ManagerDashboard = () => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Station Animals" value={45} />
      <StatCard title="Active" value={cattle.filter(c => c.status === 'Active').length} />
      <StatCard title="Recent Purchases" value="3" />
      <StatCard title="Feed Stock" value="OK" sub="All items above threshold" />
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back — {role} view</p>
      </div>
      {dashboards[role] || <AdminDashboard />}
    </div>
  );
};

export default Dashboard;
