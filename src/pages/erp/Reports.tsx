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
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statusBreakdown = [
  { name: 'Active', value: cattle.filter(c => c.status === 'Active').length, color: '#3B82F6' },
  { name: 'Fattening', value: cattle.filter(c => c.status === 'Fattening').length, color: '#F97316' },
  { name: 'Ready', value: cattle.filter(c => c.status === 'Ready for Sale').length, color: '#3db83d' },
  { name: 'Listed', value: cattle.filter(c => c.status === 'Listed').length, color: '#8B5CF6' },
  { name: 'Sold', value: cattle.filter(c => c.status === 'Sold').length, color: '#6B7280' },
];

const monthlyRevenue = [
  { month: 'Sep', revenue: 320000 }, { month: 'Oct', revenue: 450000 },
  { month: 'Nov', revenue: 890000 }, { month: 'Dec', revenue: 520000 },
  { month: 'Jan', revenue: 410000 }, { month: 'Feb', revenue: 1410000 },
];

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
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-4">Reports</h1>

    <Tabs defaultValue="cattle">
      <TabsList className="flex-wrap">
        <TabsTrigger value="cattle">Cattle</TabsTrigger>
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="health">Health</TabsTrigger>
        <TabsTrigger value="finance">Finance</TabsTrigger>
        <TabsTrigger value="rent">Rent</TabsTrigger>
      </TabsList>

      <TabsContent value="cattle">
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => exportCSV(cattle as any, 'cattle-report')}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Status Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={statusBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Total Animals Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={[{ m: 'Oct', count: 8 }, { m: 'Nov', count: 11 }, { m: 'Dec', count: 12 }, { m: 'Jan', count: 14 }, { m: 'Feb', count: 15 }]}>
                  <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="m" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sales">
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => exportCSV(sales as any, 'sales-report')}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
        <Card className="mb-4"><CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Period</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table><TableHeader><TableRow className="bg-muted/50">
            <TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Animals</TableHead><TableHead className="text-right">Total</TableHead>
          </TableRow></TableHeader>
          <TableBody>{sales.map(s => (
            <TableRow key={s.id}><TableCell className="font-mono text-xs">{s.id}</TableCell><TableCell>{s.date}</TableCell>
              <TableCell><StatusBadge status={s.type} /></TableCell><TableCell>{s.animals}</TableCell>
              <TableCell className="text-right font-medium">PKR {s.total.toLocaleString()}</TableCell></TableRow>
          ))}</TableBody></Table>
        </div>
      </TabsContent>

      <TabsContent value="health">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Vaccination Compliance</p><p className="text-3xl font-bold text-primary">67%</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Overdue Vaccinations</p><p className="text-3xl font-bold text-destructive">{vaccinations.filter(v => v.status === 'Overdue').length}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Active Treatments</p><p className="text-3xl font-bold text-amber-500">2</p></CardContent></Card>
        </div>
      </TabsContent>

      <TabsContent value="finance">
        <div className="flex justify-end mb-3">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => exportCSV(transactions as any, 'finance-report')}><Download className="h-3 w-3" />Export CSV</Button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Income</p><p className="text-2xl font-bold text-green-600">PKR 1,820,000</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Expenses</p><p className="text-2xl font-bold text-red-500">PKR 580,000</p></CardContent></Card>
        </div>
      </TabsContent>

      <TabsContent value="rent">
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table><TableHeader><TableRow className="bg-muted/50">
            <TableHead>Station</TableHead><TableHead>Type</TableHead><TableHead>Rent</TableHead><TableHead>Status</TableHead><TableHead>Contract</TableHead>
          </TableRow></TableHeader>
          <TableBody>{erpStations.map(s => (
            <TableRow key={s.tag}><TableCell>{s.name}</TableCell><TableCell><StatusBadge status={s.type} /></TableCell>
              <TableCell>{s.rentAmount ? `PKR ${s.rentAmount.toLocaleString()}` : '—'}</TableCell>
              <TableCell>{s.paymentStatus ? <StatusBadge status={s.paymentStatus} /> : '—'}</TableCell>
              <TableCell className="text-xs">{s.contractStart ? `${s.contractStart} → ${s.contractEnd}` : '—'}</TableCell></TableRow>
          ))}</TableBody></Table>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export default Reports;
