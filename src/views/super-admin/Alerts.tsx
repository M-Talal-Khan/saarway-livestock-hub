"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from "lucide-react";
import { adminAlerts } from "@/data/super-admin";

const severityConfig: Record<string, { icon: typeof AlertCircle; border: string; dot: string }> = {
  critical: { icon: AlertCircle, border: "border-l-sw-admin-err", dot: "bg-sw-admin-err" },
  warning: { icon: AlertTriangle, border: "border-l-sw-admin-warn", dot: "bg-sw-admin-warn" },
  info: { icon: Info, border: "border-l-sw-sky-400", dot: "bg-sw-sky-400" },
  success: { icon: CheckCircle, border: "border-l-sw-admin-green", dot: "bg-sw-admin-green" },
};

const Alerts = () => {
  const router = useRouter();
  const [alerts, setAlerts] = useState(adminAlerts);
  const [sevFilter, setSevFilter] = useState("all");

  const filtered = alerts.filter((a) => sevFilter === "all" || a.severity === sevFilter);

  const dismiss = (id: number) => setAlerts((prev) => prev.filter((a) => a.id !== id));

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
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <Card key={alert.id} className={`border-l-[3px] ${config.border} cursor-pointer hover:-translate-y-0.5`} onClick={() => router.push(alert.link)}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-full ${config.dot}/10`}>
                  <Icon className={`h-4 w-4`} style={{ color: `var(--tw-${alert.severity})` }} />
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
