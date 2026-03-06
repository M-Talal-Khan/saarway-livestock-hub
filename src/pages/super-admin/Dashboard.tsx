import { Building2, Store, DollarSign, AlertTriangle, Bell, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const statCards = [
  { label: "Total Farms Registered", value: "12", icon: Building2, accent: "border-l-[3px] border-l-sw-admin-green", iconBg: "bg-sw-admin-green/10", iconColor: "text-sw-admin-green" },
  { label: "Total Active Listings", value: "48", icon: Store, accent: "border-l-[3px] border-l-sw-sky-400", iconBg: "bg-sw-sky-400/10", iconColor: "text-sw-sky-400" },
  { label: "Total Platform Revenue", value: "PKR 284,000", icon: DollarSign, accent: "border-l-[3px] border-l-sw-gold-400", iconBg: "bg-sw-gold-400/10", iconColor: "text-sw-gold-400" },
  { label: "Pending Farm Requests", value: "3", icon: AlertTriangle, accent: "border-l-[3px] border-l-sw-admin-err", iconBg: "bg-sw-admin-err/10", iconColor: "text-sw-admin-err", action: true },
];

const recentAlerts = [
  { severity: "critical", message: "Green Valley Farms — PKR 4,550 overdue", time: "2 hours ago" },
  { severity: "info", message: "New farm registration from Rawalpindi", time: "5 hours ago" },
  { severity: "warning", message: "Listing #109 suspended — Baloch Livestock", time: "1 day ago" },
];

const recentMessages = [
  { sender: "Asad Khan", type: "Farm Owner", preview: "I want to register my farm in Peshawar...", date: "Mar 4" },
  { sender: "Fatima Noor", type: "General User", preview: "How do I contact a seller after...", date: "Mar 3" },
  { sender: "Usman Ali", type: "Farm Owner", preview: "We have 5 stations and want to...", date: "Mar 1" },
];

const recentApprovals = [
  { farmName: "Northern Pastures", farmId: "F007", date: "Feb 28" },
  { farmName: "Sindh Agri Farms", farmId: "F006", date: "Feb 25" },
  { farmName: "Baloch Livestock", farmId: "F005", date: "Feb 20" },
];

const severityDot: Record<string, string> = {
  critical: "bg-sw-admin-err",
  warning: "bg-sw-admin-warn",
  info: "bg-sw-sky-400",
  success: "bg-sw-admin-green",
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  onClick={() => navigate("/super-admin/farms")}
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
            {recentAlerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/super-admin/alerts")}>
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
            {recentMessages.map((m, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate("/super-admin/messages")}>
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
            {recentApprovals.map((a, i) => (
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
