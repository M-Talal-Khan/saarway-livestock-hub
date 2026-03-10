"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DollarSign, AlertTriangle, Users, ChevronDown, Download, Info, Loader2, Calculator, CheckCircle2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

interface BillingRecord {
  id: string;
  farm_id: string;
  farmName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  period: string; // e.g., "Oct 2023"
  animals: number;
  previousAnimals: number;
  newAnimals: number;
  removedAnimals: number;
  listings: number;
  owed: number;
  paid: number;
  balance: number;
  status: "unpaid" | "partial" | "paid";
  rawPeriod: string; // YYYY-MM-DD
}

const Revenue = () => {
  const { toast } = useToast();
  const [data, setData] = useState<BillingRecord[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const [calculating, setCalculating] = useState(false);
  const [alreadyCalculated, setAlreadyCalculated] = useState(false);
  const [payModal, setPayModal] = useState<BillingRecord | null>(null);
  const [detailsModal, setDetailsModal] = useState<BillingRecord | null>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/revenue", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setData(json.records ?? []);
      setTotalOwed(json.totalOwed ?? 0);
      setTotalPaid(json.totalPaid ?? 0);
      setTotalBalance(json.totalBalance ?? 0);

      // Check if current month is already in the records
      const d = new Date();
      const currentPeriod = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().split('T')[0];
      const hasCurrentMonth = (json.records ?? []).some((r: BillingRecord) => r.rawPeriod === currentPeriod);
      setAlreadyCalculated(hasCurrentMonth);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCalculateMonth = async () => {
    setCalculating(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/revenue", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCalculating(false);

    if (res.ok) {
      const data = await res.json();
      if (data.alreadyCalculated) {
        toast({ title: "Already Calculated", description: "Revenue for this month is already computed." });
      } else {
        toast({ title: "Current month calculated", description: "All active animals and listings were snapshotted." });
      }
      fetchData();
    } else {
      toast({ title: "Failed to calculate", variant: "destructive" });
    }
  };

  const handlePay = async () => {
    if (!payModal) return;
    const amount = parseFloat(payAmount);
    if (amount <= 0) {
      toast({ title: "Invalid amount", description: "Payment must be greater than 0.", variant: "destructive" });
      return;
    }
    const newTotalPaid = payModal.paid + amount;
    if (newTotalPaid > payModal.owed) {
      toast({ title: "Cannot overpay", description: `This payment would exceed the total owed (PKR ${payModal.owed.toLocaleString()}). Maximum allowed is PKR ${(payModal.owed - payModal.paid).toLocaleString()}.`, variant: "destructive" });
      return;
    }

    setPaying(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/revenue", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: payModal.id, amount_paid: newTotalPaid }),
    });
    setPaying(false);

    if (res.ok) {
      toast({ title: "Payment recorded", description: `Recorded PKR ${amount} for ${payModal.farmName}` });
      setPayModal(null);
      fetchData();
    } else {
      toast({ title: "Failed to record payment", variant: "destructive" });
    }
  };

  const openPayModal = (record: BillingRecord) => {
    setPayModal(record);
    setPayAmount(record.balance > 0 ? record.balance.toString() : "0");
  };

  const stats = [
    { label: "Total Historical Amount Owed", value: `PKR ${totalOwed.toLocaleString()}`, icon: DollarSign, accent: "border-l-[3px] border-l-sw-admin-green", bg: "bg-sw-admin-green/10", color: "text-sw-admin-green" },
    { label: "Total Amount Collected", value: `PKR ${totalPaid.toLocaleString()}`, icon: CheckCircle2, accent: "border-l-[3px] border-l-sw-sky-400", bg: "bg-sw-sky-400/10", color: "text-sw-sky-400" },
    { label: "Outstanding Balance", value: `PKR ${totalBalance.toLocaleString()}`, icon: AlertTriangle, accent: "border-l-[3px] border-l-sw-admin-err", bg: "bg-sw-admin-err/10", color: "text-sw-admin-err" },
  ];

  const filteredData = data.filter(r =>
    r.farmName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter === "all" || r.status === statusFilter)
  );

  const exportCSV = () => {
    const header = "Period,Farm,Starting Animals,Added,Removed,Current Animals,Listings,Owed,Paid,Balance,Status\n";
    const rows = filteredData.map((r) => `${r.rawPeriod},${r.farmName},${r.previousAnimals},${r.newAnimals},${r.removedAnimals},${r.animals},${r.listings},${r.owed},${r.paid},${r.balance},${r.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "saarway-revenue-history.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV Exported" });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      unpaid: "bg-[#FEE2E2] text-[#991B1B]",
      partial: "bg-[#FEF3C7] text-[#92400E]",
      paid: "bg-[#D1FAE5] text-[#065F46]",
    };
    return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-sw-admin-green" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Revenue Tracking</h1>
        <Button
          onClick={handleCalculateMonth}
          disabled={calculating || alreadyCalculated}
          className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 gap-2"
        >
          {calculating ? <Loader2 className="h-4 w-4 animate-spin" /> : (alreadyCalculated ? <CheckCircle2 className="h-4 w-4" /> : <Calculator className="h-4 w-4" />)}
          {alreadyCalculated ? "Month Already Calculated" : "Calculate Current Month"}
        </Button>
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer border-sw-sky-400">
            <CardContent className="p-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-sw-sky-400" />
              <span className="text-sm font-medium text-foreground">How Revenue Works</span>
              <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-1">
            <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
              <strong>1. Calculate Month:</strong> Click the button above at the start of every month. It snapshots the current active animals (PKR 50/ea) and active listings (PKR 50/ea) for all farms and creates invoices for this month. <em>Note: The system will prevent you from calculating the same month twice.</em><br />
              <strong>2. Mark Paid:</strong> When a farm pays you, click "Update Payment" to record the amount received. You cannot exceed the total amount owed.
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Billing History</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search farm name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[130px] h-9">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 h-9 shrink-0">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Farm Name</TableHead>
                <TableHead className="text-center">Start Animals</TableHead>
                <TableHead className="text-center text-sw-green-600">Added</TableHead>
                <TableHead className="text-center text-sw-admin-err">Removed</TableHead>
                <TableHead className="font-bold">Curr. Animals</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Owed</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-10">
                  {searchQuery || statusFilter !== "all" ? "No matching records found." : "No revenue data. Click \"Calculate Current Month\" to generate bills."}
                </TableCell></TableRow>
              ) : filteredData.map((r) => (
                <TableRow key={r.id} className={r.status === "paid" ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{r.period}</TableCell>
                  <TableCell>{r.farmName}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{r.previousAnimals}</TableCell>
                  <TableCell className="text-center text-sw-green-600 font-medium">+{r.newAnimals}</TableCell>
                  <TableCell className="text-center text-sw-admin-err font-medium">-{r.removedAnimals}</TableCell>
                  <TableCell className="font-bold">{r.animals}</TableCell>
                  <TableCell>{r.listings}</TableCell>
                  <TableCell>PKR {(r.owed).toLocaleString()}</TableCell>
                  <TableCell className="text-sw-admin-green">PKR {(r.paid).toLocaleString()}</TableCell>
                  <TableCell className={r.balance > 0 ? "text-sw-admin-err font-semibold" : ""}>PKR {r.balance.toLocaleString()}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-sw-sky-400 text-sw-sky-400 hover:bg-sw-sky-400/5"
                        onClick={() => setDetailsModal(r)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => openPayModal(r)}
                      >
                        Update Payment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Update Modal */}
      <Dialog open={!!payModal} onOpenChange={() => { setPayModal(null); setPayAmount(""); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment for {payModal?.farmName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium text-foreground">{payModal?.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Owed:</span>
                <span className="font-medium text-foreground">PKR {payModal?.owed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previously Paid:</span>
                <span className="font-medium text-sw-admin-green">PKR {payModal?.paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground font-semibold">Remaining Balance:</span>
                <span className="font-bold text-sw-admin-err">PKR {payModal?.balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Payment Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground sm:text-sm">PKR</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="pl-12"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the new amount being paid today. This will be added to the previously paid amount.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPayModal(null)}>Cancel</Button>
            <Button
              className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90"
              onClick={handlePay}
              disabled={paying || !payAmount}
            >
              {paying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Farm Details Dialog ── */}
      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Farm Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 pr-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Farm Name</span>
                <span className="font-medium text-foreground">{detailsModal?.farmName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Farm ID</span>
                <span className="font-mono text-foreground">{detailsModal?.farm_id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Owner Name</span>
                <span className="font-medium text-foreground">{detailsModal?.ownerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">City</span>
                <span className="font-medium text-foreground">{detailsModal?.city}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div>
                <span className="text-muted-foreground block text-xs">Email Address</span>
                <a
                  href={`mailto:${detailsModal?.email}`}
                  className="font-medium text-sw-sky-400 hover:underline inline-flex items-center gap-2"
                >
                  {detailsModal?.email || "No email provided"}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Phone Number</span>
                <a
                  href={`tel:${detailsModal?.phone}`}
                  className="font-medium text-sw-sky-400 hover:underline inline-flex items-center gap-2"
                >
                  {detailsModal?.phone || "No phone provided"}
                </a>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Revenue;
