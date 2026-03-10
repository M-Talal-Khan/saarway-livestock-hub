"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Store, DollarSign, AlertTriangle, Bell, MessageSquare, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

const severityDot: Record<string, string> = {
  critical: "bg-sw-admin-err",
  warning: "bg-sw-admin-warn",
  info: "bg-sw-sky-400",
  success: "bg-sw-admin-green",
};

interface DashboardData {
  stats: { totalFarms: number; pendingRequests: number; activeListings: number; estimatedRevenue?: number };
  recentAlerts: { severity: string; message: string; time: string; link: string }[];
  recentMessages: { id: string; sender: string; type: string; preview: string; date: string }[];
  recentApprovals: { farmName: string; farmId: string; date: string }[];
}

const SuperAdminDashboard = () => {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  if (loading || !data) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-sw-admin-green" /></div>;

  const statCards = [
    { label: "Total Farms", value: String(data.stats.totalFarms), icon: Building2, accent: "border-l-[3px] border-l-sw-admin-green", iconBg: "bg-sw-admin-green/10", iconColor: "text-sw-admin-green" },
    { label: "Active Listings", value: String(data.stats.activeListings), icon: Store, accent: "border-l-[3px] border-l-sw-sky-400", iconBg: "bg-sw-sky-400/10", iconColor: "text-sw-sky-400" },
    { label: "Pending Requests", value: String(data.stats.pendingRequests), icon: AlertTriangle, accent: "border-l-[3px] border-l-sw-admin-err", iconBg: "bg-sw-admin-err/10", iconColor: "text-sw-admin-err", action: data.stats.pendingRequests > 0 },
    { label: "Current Mtd Revenue", value: `PKR ${data.stats.estimatedRevenue?.toLocaleString() ?? 0}`, icon: DollarSign, accent: "border-l-[3px] border-l-amber-500", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className={`${card.accent} hover:-translate-y-1`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-full ${card.iconBg}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              {card.action && (
                <Button
                  size="sm"
                  className="mt-3 bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 text-xs"
                  onClick={() => router.push("/super-admin/farms")}
                >
                  Review
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-sw-admin-err" /> Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No alerts</p>
            ) : data.recentAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(a.link)}>
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${severityDot[a.severity]}`} />
                <div className="min-w-0">
                  <p className="text-sm text-foreground leading-snug">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-sw-sky-400" /> Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No messages</p>
            ) : data.recentMessages.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push("/super-admin/messages")}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{m.sender}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sw-sky-400/10 text-sw-sky-400 font-medium">{m.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.preview}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{m.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Approvals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-sw-admin-green" /> Recent Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentApprovals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No approvals yet</p>
            ) : data.recentApprovals.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{a.farmName}</p>
                  <p className="text-xs text-muted-foreground">{a.farmId}</p>
                </div>
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
