"use client";

import { cattle } from '@/data/erp/cattle';
import { sales } from '@/data/erp/sales';
import { vaccinations } from '@/data/erp/vaccinations';
import { transactions } from '@/data/erp/transactions';
import { erpStations } from '@/data/erp/erpStations';
import StatusBadge from '@/components/erp/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_TOOLTIP_STYLE = {
  background: 'white', border: 'none', borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', borderTop: '3px solid hsl(120,50%,48%)', padding: '12px 16px',
};
const CHART_CURSOR = { fill: 'rgba(61,184,61,0.06)' };

const PIE_GRADIENTS = [
  { id: 'rPieGreen', from: '#3db83d', to: '#1f9e1f' },
  { id: 'rPieGold', from: '#f5d87a', to: '#d4a934' },
  { id: 'rPieSky', from: '#4dc8e8', to: '#2a9ec0' },
  { id: 'rPiePurple', from: '#8b5cf6', to: '#6d28d9' },
  { id: 'rPieGrey', from: '#9ca3af', to: '#6b7280' },
];

// Inline defs used directly inside each chart (not as a component)

const statusBreakdown = [
  { name: 'Active', value: cattle.filter(c => c.status === 'Active').length },
  { name: 'Fattening', value: cattle.filter(c => c.status === 'Fattening').length },
  { name: 'Ready', value: cattle.filter(c => c.status === 'Ready for Sale').length },
  { name: 'Listed', value: cattle.filter(c => c.status === 'Listed').length },
  { name: 'Sold', value: cattle.filter(c => c.status === 'Sold').length },
];

const monthlyRevenue = [
  { month: 'Sep', revenue: 320000 }, { month: 'Oct', revenue: 450000 },
  { month: 'Nov', revenue: 890000 }, { month: 'Dec', revenue: 520000 },
  { month: 'Jan', revenue: 410000 }, { month: 'Feb', revenue: 1410000 },
];

const animalTimeline = [{ m: 'Oct', count: 8 }, { m: 'Nov', count: 11 }, { m: 'Dec', count: 12 }, { m: 'Jan', count: 14 }, { m: 'Feb', count: 15 }];

const exportCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(d => Object.values(d).join(','));
  const csv = headers + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast({ title: 'Exported', description: `${filename}.csv downloaded` });
};

const Reports = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold text-foreground">Reports</h1>

    <Tabs defaultValue="cattle">
      <TabsList>
        <TabsTrigger value="cattle">Cattle</TabsTrigger>
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="health">Health</TabsTrigger>
        <TabsTrigger value="finance">Finance</TabsTrigger>
        <TabsTrigger value="rent">Rent</TabsTrigger>
      </TabsList>

      <TabsContent value="cattle" className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportCSV(cattle as any, 'cattle-report')}><Download className="h-4 w-4" />Export CSV</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Status Breakdown</CardTitle></CardHeader>
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
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} cornerRadius={6} stroke="#fff" strokeWidth={3} label animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 8px rgba(0,0,0,0.12))' }}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={`url(#${PIE_GRADIENTS[i % PIE_GRADIENTS.length].id})`} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Total Animals Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={animalTimeline}>
                  <defs>
                    <linearGradient id="rGreenArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3db83d" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3db83d" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                  <XAxis dataKey="m" fontSize={12} /><YAxis fontSize={12} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} />
                  <Area type="monotone" dataKey="count" stroke="#3db83d" strokeWidth={3} fill="url(#rGreenArea)" dot={{ r: 5, fill: '#3db83d', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#1f9e1f', stroke: '#fff', strokeWidth: 3 }} animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sales" className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportCSV(sales as any, 'sales-report')}><Download className="h-4 w-4" />Export CSV</Button>
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue by Period</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="rGreenBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ad88a" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1f9e1f" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(120,46%,62%,0.15)" />
                <XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={CHART_CURSOR} />
                <Bar dataKey="revenue" fill="url(#rGreenBar)" radius={[8,8,0,0]} animationDuration={1200} style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))' }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead><TableHead className="text-right">Total</TableHead>
              </TableRow></TableHeader>
              <TableBody>{sales.map(s => (
                <TableRow key={s.id}><TableCell className="font-mono text-xs">{s.id}</TableCell><TableCell>{s.date}</TableCell>
                  <TableCell><StatusBadge status={s.type} /></TableCell><TableCell>{s.animals}</TableCell>
                  <TableCell className="text-right font-medium">PKR {s.total.toLocaleString()}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="health">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Vaccination Compliance', value: '67%', color: 'text-primary', border: 'border-l-[3px] border-l-primary' },
            { label: 'Overdue Vaccinations', value: String(vaccinations.filter(v => v.status === 'Overdue').length), color: 'text-destructive', border: 'border-l-[3px] border-l-destructive' },
            { label: 'Active Treatments', value: '2', color: 'text-sw-gold-400', border: 'border-l-[3px] border-l-sw-gold-400' },
          ].map(s => (
            <Card key={s.label} className={`${s.border} hover:-translate-y-1`}>
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="finance" className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportCSV(transactions as any, 'finance-report')}><Download className="h-4 w-4" />Export CSV</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-l-[3px] border-l-primary hover:-translate-y-1">
            <CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Income</p><p className="text-2xl font-bold text-sw-green-700 mt-1">PKR 1,820,000</p></CardContent>
          </Card>
          <Card className="border-l-[3px] border-l-destructive hover:-translate-y-1">
            <CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-destructive mt-1">PKR 580,000</p></CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="rent">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Station</TableHead><TableHead>Type</TableHead><TableHead>Rent</TableHead><TableHead>Status</TableHead><TableHead>Contract</TableHead>
              </TableRow></TableHeader>
              <TableBody>{erpStations.map(s => (
                <TableRow key={s.tag}><TableCell className="font-medium">{s.name}</TableCell><TableCell><StatusBadge status={s.type} /></TableCell>
                  <TableCell>{s.rentAmount ? `PKR ${s.rentAmount.toLocaleString()}` : '—'}</TableCell>
                  <TableCell>{s.paymentStatus ? <StatusBadge status={s.paymentStatus} /> : '—'}</TableCell>
                  <TableCell className="text-xs">{s.contractStart ? `${s.contractStart} → ${s.contractEnd}` : '—'}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default Reports;
