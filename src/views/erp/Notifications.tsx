"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, ERPNotification } from "@/hooks/useNotifications";
import { AlertCircle, AlertTriangle, Info, Check, Bell, RefreshCw, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const severityIcon = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityColor = {
  critical: "text-destructive",
  warning: "text-amber-500",
  info: "text-blue-500",
};

const severityBg = {
  critical: "border-l-destructive bg-destructive/5",
  warning: "border-l-amber-400 bg-amber-50/60",
  info: "border-l-blue-400 bg-blue-50/40",
};

const typeLabel: Record<string, string> = {
  vaccination: "Health",
  rent: "Finance",
  feed: "Feed",
  treatment: "Health",
  task_assigned: "Task",
  task_completed: "Task",
};

const NotificationCard = ({
  n,
  onRead,
  onDismiss,
}: {
  n: ERPNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const router = useRouter();
  const Icon = severityIcon[n.severity];

  const handleClick = () => {
    onRead(n.id);
    router.push(n.link);
  };

  return (
    <div className={`border-l-[3px] rounded-lg p-4 flex gap-4 items-start ${severityBg[n.severity]} ${!n.is_read ? "opacity-100" : "opacity-60"}`}>
      <div className="relative shrink-0 mt-0.5">
        <Icon className={`h-5 w-5 ${severityColor[n.severity]}`} />
        {!n.is_read && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
      <button onClick={handleClick} className="flex-1 min-w-0 text-left hover:brightness-95 transition-all duration-200">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {typeLabel[n.type] ?? n.type}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 capitalize ${severityColor[n.severity]}`}
          >
            {n.severity}
          </Badge>
          {n.persistent && (
            <span className="text-[9px] text-muted-foreground">
              {new Date(n.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        {n.title && (
          <p className={`text-sm font-semibold mb-0.5 ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
            {n.title}
          </p>
        )}
        <p className={`text-sm leading-relaxed ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
          {n.message}
        </p>
      </button>
      <button
        onClick={() => onDismiss(n.id)}
        className="shrink-0 mt-0.5 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const NotificationsView = () => {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss, dismissAll, refresh } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

  const byTab = (tab: string) => {
    if (tab === "all") return notifications;
    if (tab === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.severity === tab);
  };

  const counts = {
    all: notifications.length,
    unread: unreadCount,
    critical: notifications.filter((n) => n.severity === "critical").length,
    warning: notifications.filter((n) => n.severity === "warning").length,
    info: notifications.filter((n) => n.severity === "info").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between erp-slide-up">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground text-xs px-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 text-primary border-primary/40 hover:bg-primary/10" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8 text-destructive border-destructive/40 hover:bg-destructive/10" onClick={dismissAll}>
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="erp-glass-card-subtle erp-stagger-1">
          <CardContent className="py-20 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">All clear — no active alerts</p>
            <p className="text-xs text-muted-foreground mt-1">
              Notifications appear here for tasks, vaccinations, rent, feed, and more.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="erp-stagger-1">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {(["all", "unread", "critical", "warning", "info"] as const).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize text-xs gap-1.5">
                {tab}
                {counts[tab] > 0 && (
                  <span className={`px-1.5 py-0 rounded-full text-[10px] font-bold ${tab === "critical" ? "bg-destructive/20 text-destructive" :
                      tab === "warning" ? "bg-amber-100 text-amber-700" :
                        "bg-muted text-muted-foreground"
                    }`}>
                    {counts[tab]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {(["all", "unread", "critical", "warning", "info"] as const).map((tab) => {
            const items = byTab(tab);
            return (
              <TabsContent key={tab} value={tab} className="space-y-2">
                {items.length === 0 ? (
                  <Card className="erp-glass-card-subtle">
                    <CardContent className="py-12 text-center text-muted-foreground text-sm">
                      No {tab === "all" ? "" : tab} notifications
                    </CardContent>
                  </Card>
                ) : (
                  items.map((n) => (
                    <NotificationCard key={n.id} n={n} onRead={markRead} onDismiss={dismiss} />
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

export default NotificationsView;
