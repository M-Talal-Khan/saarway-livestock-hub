import { transactions } from '@/data/erp/transactions';
import { erpStations } from '@/data/erp/erpStations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, ChevronDown } from 'lucide-react';

const revenueData = [
  { month: 'Sep', income: 320000, expenses: 280000 },
  { month: 'Oct', income: 450000, expenses: 520000 },
  { month: 'Nov', income: 890000, expenses: 620000 },
  { month: 'Dec', income: 520000, expenses: 380000 },
  { month: 'Jan', income: 410000, expenses: 985300 },
  { month: 'Feb', income: 1410000, expenses: 774150 },
];

const expenseCategories = [
  { name: 'Cattle Purchase', value: 1587850, color: '#3B82F6' },
  { name: 'Feed', value: 35000, color: '#F97316' },
  { name: 'Medical', value: 1500, color: '#EF4444' },
  { name: 'Salary', value: 90000, color: '#8B5CF6' },
  { name: 'Rent', value: 45000, color: '#6B7280' },
  { name: 'Marketplace', value: 100, color: '#14B8A6' },
];

const salaryData = [
  { name: 'Ahmed Raza', role: 'Manager', amount: 45000, month: 'Jan 2025', date: '2025-02-01', station: 'Station 1' },
  { name: 'Farhan Ali', role: 'Worker', amount: 25000, month: 'Jan 2025', date: '2025-02-01', station: 'Station 1' },
  { name: 'Usman Ghani', role: 'Worker', amount: 25000, month: 'Jan 2025', date: '2025-02-01', station: 'Station 2' },
];

const autoIntegrations = [
  { source: 'Purchase saved', creates: 'Expense: Cattle Purchase' },
  { source: 'Sale recorded', creates: 'Income: Cattle Sale' },
  { source: 'Treatment added', creates: 'Expense: Medical/Health' },
  { source: 'Rent marked paid', creates: 'Expense: Station Rental' },
  { source: 'Salary entry added', creates: 'Expense: Salary' },
  { source: 'Listing published', creates: 'Expense: Marketplace Fee (PKR 50) + Subscription (PKR 50/animal/month)' },
];

const FinanceRent = () => {
  const expenses = transactions.filter(t => t.type === 'Expense');
  const income = transactions.filter(t => t.type === 'Income');

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Finance & Rent</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Monthly P/L</p><p className="text-2xl font-bold text-green-600">+PKR 1,240,000</p></CardContent></Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Rent Status</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <StatusBadge status="Owned" /><StatusBadge status="Overdue" /><StatusBadge status="Paid" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Income vs Expenses</p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={revenueData.slice(-3)}>
                <Bar dataKey="income" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
                <Bar dataKey="expenses" fill="#F97316" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Top Expenses</p>
            <ResponsiveContainer width="100%" height={80}>
              <PieChart>
                <Pie data={expenseCategories.slice(0, 4)} dataKey="value" cx="50%" cy="50%" outerRadius={35}>
                  {expenseCategories.slice(0, 4).map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Integration Info */}
      <Collapsible className="mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 text-xs mb-1"><Info className="h-3 w-3" />Auto-Finance Integrations <ChevronDown className="h-3 w-3" /></Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card><CardContent className="p-3">
            <Table><TableBody>
              {autoIntegrations.map((a, i) => (
                <TableRow key={i}><TableCell className="text-xs">{a.source}</TableCell><TableCell className="text-xs">→ {a.creates}</TableCell></TableRow>
              ))}
            </TableBody></Table>
          </CardContent></Card>
        </CollapsibleContent>
      </Collapsible>

      <Tabs defaultValue="expenses">
        <TabsList><TabsTrigger value="expenses">Expenses</TabsTrigger><TabsTrigger value="income">Income</TabsTrigger><TabsTrigger value="rent">Rent</TabsTrigger><TabsTrigger value="salary">Salary</TabsTrigger></TabsList>

        <TabsContent value="expenses">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {expenses.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell><TableCell><StatusBadge status={t.category} /></TableCell>
                    <TableCell className="text-xs">{t.description}</TableCell><TableCell>{t.station}</TableCell>
                    <TableCell className="text-right font-medium text-red-500">-PKR {t.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead>Description</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {income.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell><TableCell>{t.category}</TableCell>
                    <TableCell className="text-xs">{t.description}</TableCell><TableCell>{t.station}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">+PKR {t.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rent">
          <div className="grid md:grid-cols-3 gap-4">
            {erpStations.map(s => (
              <Card key={s.tag}>
                <CardContent className="p-4">
                  <p className="font-semibold">{s.name}</p>
                  <StatusBadge status={s.type} className="mt-1" />
                  {s.type === 'Rented' && (
                    <div className="mt-3 space-y-1 text-xs">
                      <p>Rent: PKR {s.rentAmount?.toLocaleString()}</p>
                      <p>Owner: {s.ownerName}</p>
                      <p>Contract: {s.contractStart} → {s.contractEnd}</p>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={s.paymentStatus || 'Unpaid'} />
                        {s.paymentStatus !== 'Paid' && <Button size="sm" className="h-6 text-xs">Mark Paid</Button>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="salary">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader><TableRow className="bg-muted/50">
                <TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Amount</TableHead><TableHead>Month</TableHead><TableHead>Date</TableHead><TableHead>Station</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {salaryData.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.name}</TableCell><TableCell>{s.role}</TableCell>
                    <TableCell className="font-medium">PKR {s.amount.toLocaleString()}</TableCell>
                    <TableCell>{s.month}</TableCell><TableCell>{s.date}</TableCell><TableCell>{s.station}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceRent;
