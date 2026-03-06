import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DollarSign, TrendingUp, AlertTriangle, Users, ChevronDown, Download, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { revenueData, monthlyRevenueChart } from "@/data/super-admin";

const Revenue = () => {
  const { toast } = useToast();
  const [data, setData] = useState(revenueData);
  const [markPaidModal, setMarkPaidModal] = useState<string | null>(null);

  const totalRevenue = 284000;
  const thisMonth = 42000;
  const outstanding = data.reduce((s, f) => s + f.balance, 0);
  const totalAnimals = data.reduce((s, f) => s + f.animals, 0);

  const stats = [
    { label: "Total Revenue Collected", value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, accent: "border-l-[3px] border-l-sw-admin-green", bg: "bg-sw-admin-green/10", color: "text-sw-admin-green" },
    { label: "This Month Revenue", value: `PKR ${thisMonth.toLocaleString()}`, icon: TrendingUp, accent: "border-l-[3px] border-l-sw-gold-400", bg: "bg-sw-gold-400/10", color: "text-sw-gold-400" },
    { label: "Outstanding Balance", value: `PKR ${outstanding.toLocaleString()}`, icon: AlertTriangle, accent: "border-l-[3px] border-l-sw-admin-err", bg: "bg-sw-admin-err/10", color: "text-sw-admin-err" },
    { label: "Total Active Animals", value: totalAnimals.toString(), icon: Users, accent: "border-l-[3px] border-l-sw-sky-400", bg: "bg-sw-sky-400/10", color: "text-sw-sky-400" },
  ];

  const handleMarkPaid = () => {
    setData((d) => d.map((f) => f.farm === markPaidModal ? { ...f, paid: f.owed, balance: 0 } : f));
    toast({ title: "Marked as Paid", description: `${markPaidModal} balance cleared.` });
    setMarkPaidModal(null);
  };

  const exportCSV = () => {
    const header = "Farm,Animals,Sub Fee,Listings,List Fee,Owed,Paid,Balance\n";
    const rows = data.map((f) => `${f.farm},${f.animals},${f.subFee},${f.listings},${f.listFee},${f.owed},${f.paid},${f.balance}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "saarway-revenue.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV Exported" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Revenue</h1>

      {/* Fee Structure */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer">
            <CardContent className="p-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-sw-sky-400" />
              <span className="text-sm font-medium text-foreground">Fee Structure Info</span>
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-1">
            <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
              <strong>Subscription Fee:</strong> PKR 50 per active animal per month (based on cattle count in farm ERP).<br />
              <strong>Listing Fee:</strong> PKR 50 per listing (one-time, at time of listing).<br />
              Both tracked and marked as paid manually by Super Admin. No automatic payment processing.
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className={s.accent}>
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
              <div className={`p-2.5 rounded-full ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120 46% 62% / 0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#4ad88a" name="Collected" radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar dataKey="outstanding" fill="#e85858" name="Outstanding" radius={[4, 4, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per Farm Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Per Farm Revenue</CardTitle>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm Name</TableHead>
                <TableHead>Animals</TableHead>
                <TableHead>Sub Fee</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>List Fee</TableHead>
                <TableHead>Total Owed</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((f) => (
                <TableRow key={f.farm}>
                  <TableCell className="font-medium">{f.farm}</TableCell>
                  <TableCell>{f.animals}</TableCell>
                  <TableCell>PKR {f.subFee.toLocaleString()}</TableCell>
                  <TableCell>{f.listings}</TableCell>
                  <TableCell>PKR {f.listFee.toLocaleString()}</TableCell>
                  <TableCell>PKR {f.owed.toLocaleString()}</TableCell>
                  <TableCell>PKR {f.paid.toLocaleString()}</TableCell>
                  <TableCell className={f.balance > 0 ? "text-sw-admin-err font-semibold" : ""}>PKR {f.balance.toLocaleString()}</TableCell>
                  <TableCell>
                    {f.balance > 0 ? (
                      <Button size="sm" className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 text-xs" onClick={() => setMarkPaidModal(f.farm)}>Mark as Paid</Button>
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">Paid</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mark Paid Modal */}
      <Dialog open={!!markPaidModal} onOpenChange={() => setMarkPaidModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Mark outstanding balance for <strong>{markPaidModal}</strong> as paid?</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMarkPaidModal(null)}>Cancel</Button>
            <Button className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90" onClick={handleMarkPaid}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Revenue;
