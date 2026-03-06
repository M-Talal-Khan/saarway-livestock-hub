"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Building2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminListings, activeFarms } from "@/data/super-admin";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: "bg-[#D1FAE5] text-[#065F46]",
    Suspended: "bg-[#FEE2E2] text-[#991B1B]",
    Paid: "bg-[#D1FAE5] text-[#065F46]",
    Overdue: "bg-[#FEE2E2] text-[#991B1B]",
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
};

const MarketplaceOverview = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState(adminListings);
  const [farmFilter, setFarmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = listings.filter((l) => {
    if (farmFilter !== "all" && l.farm !== farmFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  const activeCount = listings.filter((l) => l.status === "Active").length;
  const suspendedCount = listings.filter((l) => l.status === "Suspended").length;
  const activeFarmCount = new Set(listings.filter((l) => l.status === "Active").map((l) => l.farm)).size;

  const toggleStatus = (id: number) => {
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: l.status === "Active" ? "Suspended" as const : "Active" as const } : l));
    toast({ title: "Listing updated" });
  };

  const stats = [
    { label: "Total Active Listings", value: activeCount, icon: Store, color: "text-sw-admin-green", bg: "bg-sw-admin-green/10" },
    { label: "Active Listing Farms", value: activeFarmCount, icon: Building2, color: "text-sw-sky-400", bg: "bg-sw-sky-400/10" },
    { label: "Suspended Listings", value: suspendedCount, icon: AlertTriangle, color: "text-sw-admin-err", bg: "bg-sw-admin-err/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Marketplace Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-full ${s.bg}`}><s.icon className={`h-5 w-5 ${s.color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Farm Breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-base">Farm Breakdown</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm Name</TableHead>
                <TableHead>Active Listings</TableHead>
                <TableHead>Fee Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeFarms.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.listings}</TableCell>
                  <TableCell>{statusBadge(f.feeStatus)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Listings */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Listings</CardTitle>
            <div className="flex gap-2">
              <Select value={farmFilter} onValueChange={setFarmFilter}>
                <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="All Farms" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Farms</SelectItem>
                  {[...new Set(listings.map((l) => l.farm))].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Price (PKR)</TableHead>
                <TableHead>Listed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-sm">#{l.id}</TableCell>
                  <TableCell>{l.animal}</TableCell>
                  <TableCell>{l.farm}</TableCell>
                  <TableCell>{l.price.toLocaleString()}</TableCell>
                  <TableCell>{l.date}</TableCell>
                  <TableCell>{statusBadge(l.status)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className={l.status === "Active" ? "border-destructive text-destructive hover:bg-destructive/5 text-xs" : "border-sw-admin-green text-sw-admin-green hover:bg-sw-admin-green/5 text-xs"}
                      onClick={() => toggleStatus(l.id)}
                    >
                      {l.status === "Active" ? "Suspend" : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceOverview;
