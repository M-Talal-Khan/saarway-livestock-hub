"use client";

import { transactions } from '@/data/erp/transactions';
import { erpStations } from '@/data/erp/erpStations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Info, ChevronDown, DollarSign, Home, TrendingUp, TrendingDown } from 'lucide-react';

const CHART_TOOLTIP_STYLE = {
  background: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderTop: '3px solid hsl(120,50%,48%)', padding: '12px 16px',
};
const CHART_CURSOR = { fill: 'rgba(61,184,61,0.06)' };

const PIE_GRADIENTS = [
  { id: 'fPieGreen', from: '#3db83d', to: '#1f9e1f' },
  { id: 'fPieGold', from: '#f5d87a', to: '#d4a934' },
  { id: 'fPieRed', from: '#e85858', to: '#b91c1c' },
  { id: 'fPieSky', from: '#4dc8e8', to: '#2a9ec0' },
  { id: 'fPieDarkGreen', from: '#2d8a2d', to: '#1a5c1a' },
  { id: 'fPieLight', from: '#a7f3d0', to: '#6ee7b7' },
];

// Inline defs - used directly inside each chart

const revenueData = [
  { month: 'Sep', income: 320000, expenses: 280000 },
  { month: 'Oct', income: 450000, expenses: 520000 },
  { month: 'Nov', income: 890000, expenses: 620000 },
  { month: 'Dec', income: 520000, expenses: 380000 },
  { month: 'Jan', income: 410000, expenses: 985300 },
  { month: 'Feb', income: 1410000, expenses: 774150 },
];

const expenseCategories = [
  { name: 'Cattle Purchase', value: 1587850 },
  { name: 'Feed', value: 35000 },
  { name: 'Medical', value: 1500 },
  { name: 'Salary', value: 90000 },
  { name: 'Rent', value: 45000 },
  { name: 'Marketplace', value: 100 },
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
  { source: 'Listing published', creates: 'Expense: Marketplace Fee (PKR 50) + Subscription' },
];

const statCards = [
  { label: 'Monthly P/L', value: '+PKR 1,240,000', icon: DollarSign, border: 'border-l-[3px] border-l-primary', bg: 'bg-sw-green-100', color: 'text-primary' },
  { label: 'Total Income', value: 'PKR 1,820,000', icon: TrendingUp, border: 'border-l-[3px] border-l-sw-gold-400', bg: 'bg-amber-100', color: 'text-amber-600' },
  { label: 'Total Expenses', value: 'PKR 580,000', icon: TrendingDown, border: 'border-l-[3px] border-l-destructive', bg: 'bg-red-100', color: 'text-destructive' },
];

const FinanceRent = () => {
  const expenses = transactions.filter(t => t.type === 'Expense');
  const income = transactions.filter(t => t.type === 'Income');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Finance & Rent</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className={`${s.border} hover:-translate-y-1`}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Income vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <defs>
                  <linearGradient id="fGreenBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ad88a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="fGoldBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5d87a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d4a934" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} />
                <Bar dataKey="income" fill="url(#fGreenBar)" radius={[8,8,0,0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
                <Bar dataKey="expenses" fill="url(#fGoldBar)" radius={[8,8,0,0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top Expenses</CardTitle></CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

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

      <Tabs defaultValue="expenses">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Category</TableHead><TableHead>Description</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>{expenses.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell><TableCell><StatusBadge status={t.category} /></TableCell>
                  <TableCell className="text-sm">{t.description}</TableCell><TableCell>{t.station}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">-PKR {t.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="income">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Date</TableHead><TableHead>Source</TableHead><TableHead>Description</TableHead><TableHead>Station</TableHead><TableHead className="text-right">Amount</TableHead>
              </TableRow></TableHeader>
              <TableBody>{income.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell><TableCell>{t.category}</TableCell>
                  <TableCell className="text-sm">{t.description}</TableCell><TableCell>{t.station}</TableCell>
                  <TableCell className="text-right font-medium text-sw-green-700">+PKR {t.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="rent">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {erpStations.map(s => (
              <Card key={s.tag}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <StatusBadge status={s.type} />
                  </div>
                  {s.type === 'Rented' && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Rent</span><span className="font-medium">PKR {s.rentAmount?.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span>{s.ownerName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Contract</span><span className="text-xs">{s.contractStart} → {s.contractEnd}</span></div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <StatusBadge status={s.paymentStatus || 'Unpaid'} />
                        {s.paymentStatus !== 'Paid' && <Button size="sm" className="h-7 text-xs">Mark Paid</Button>}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="salary">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Amount</TableHead><TableHead>Month</TableHead><TableHead>Date</TableHead><TableHead>Station</TableHead>
              </TableRow></TableHeader>
              <TableBody>{salaryData.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{s.name}</TableCell><TableCell>{s.role}</TableCell>
                  <TableCell className="font-medium">PKR {s.amount.toLocaleString()}</TableCell>
                  <TableCell>{s.month}</TableCell><TableCell>{s.date}</TableCell><TableCell>{s.station}</TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceRent;
