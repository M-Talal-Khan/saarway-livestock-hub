"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Building2, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

interface Listing {
  id: string;
  animal: string;
  farm: string;
  price: number;
  date: string;
  status: string;
}

interface FarmBreakdown {
  id: string;
  name: string;
  listings: number;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: "bg-[#D1FAE5] text-[#065F46]",
    Sold: "bg-[#DBEAFE] text-[#1E40AF]",
    Inactive: "bg-[#F3F4F6] text-[#374151]",
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
};

const MarketplaceOverview = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [farmBreakdown, setFarmBreakdown] = useState<FarmBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [farmFilter, setFarmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/marketplace", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings ?? []);
      setFarmBreakdown(data.farmBreakdown ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = listings.filter((l) => {
    if (farmFilter !== "all" && l.farm !== farmFilter) return false;
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    return true;
  });

  const activeCount = listings.filter((l) => l.status === "Active").length;
  const soldCount = listings.filter((l) => l.status === "Sold").length;
  const activeFarmCount = new Set(listings.filter((l) => l.status === "Active").map((l) => l.farm)).size;

  const stats = [
    { label: "Total Active Listings", value: activeCount, icon: Store, color: "text-sw-admin-green", bg: "bg-sw-admin-green/10" },
    { label: "Active Listing Farms", value: activeFarmCount, icon: Building2, color: "text-sw-sky-400", bg: "bg-sw-sky-400/10" },
    { label: "Sold Listings", value: soldCount, icon: AlertTriangle, color: "text-sw-gold-400", bg: "bg-sw-gold-400/10" },
  ];

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-sw-admin-green" /></div>;

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmBreakdown.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>{f.listings}</TableCell>
                </TableRow>
              ))}
              {farmBreakdown.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No farms</TableCell></TableRow>
              )}
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
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Farm</TableHead>
                <TableHead>Price (PKR)</TableHead>
                <TableHead>Listed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-10">No listings found</TableCell></TableRow>
              ) : filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.animal}</TableCell>
                  <TableCell>{l.farm}</TableCell>
                  <TableCell>{l.price.toLocaleString()}</TableCell>
                  <TableCell>{l.date}</TableCell>
                  <TableCell>{statusBadge(l.status)}</TableCell>
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
