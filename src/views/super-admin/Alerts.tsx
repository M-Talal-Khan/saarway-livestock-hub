"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Info, CheckCircle, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

interface Alert {
  id: string;
  severity: string;
  type: string;
  message: string;
  time: string;
  link: string;
}

const severityConfig: Record<string, { icon: typeof AlertCircle; border: string; dot: string }> = {
  critical: { icon: AlertCircle, border: "border-l-sw-admin-err", dot: "bg-sw-admin-err" },
  warning: { icon: AlertTriangle, border: "border-l-sw-admin-warn", dot: "bg-sw-admin-warn" },
  info: { icon: Info, border: "border-l-sw-sky-400", dot: "bg-sw-sky-400" },
  success: { icon: CheckCircle, border: "border-l-sw-admin-green", dot: "bg-sw-admin-green" },
};

const Alerts = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sevFilter, setSevFilter] = useState("all");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const token = await getToken();

    // Fetch from dashboard endpoint (has computed alerts)
    const res = await fetch("/api/super-admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      const computed: Alert[] = (data.recentAlerts ?? []).map((a: { severity: string; message: string; time: string; link: string }, i: number) => ({
        id: `alert-${i}`,
        severity: a.severity,
        type: a.severity === "critical" ? "Critical" : a.severity === "warning" ? "Warning" : "Info",
        message: a.message,
        time: a.time,
        link: a.link,
      }));
      setAlerts(computed);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const filtered = alerts.filter((a) => sevFilter === "all" || a.severity === sevFilter);
  const dismiss = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-sw-admin-green" /></div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Alerts</h1>

      <div className="flex gap-2">
        <Select value={sevFilter} onValueChange={setSevFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="All Severities" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((alert) => {
          const config = severityConfig[alert.severity] ?? severityConfig.info;
          const Icon = config.icon;
          return (
            <Card key={alert.id} className={`border-l-[3px] ${config.border} cursor-pointer hover:-translate-y-0.5`} onClick={() => router.push(alert.link)}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-full ${config.dot}/10`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{alert.type}</span>
                  </div>
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No alerts</CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default Alerts;
