"use client";

import { useRouter } from 'next/navigation';
import { useNotifications, ERPNotification } from '@/hooks/useNotifications';
import { AlertCircle, AlertTriangle, Info, Check, Bell, Loader2, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const severityIcon: Record<string, React.ElementType> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityBorderColor: Record<string, string> = {
  critical: 'border-l-[3px] border-l-destructive',
  warning: 'border-l-[3px] border-l-amber-400',
  info: 'border-l-[3px] border-l-blue-400',
};

const severityColor: Record<string, string> = {
  critical: 'text-destructive',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications();
  const router = useRouter();

  const handleClick = (n: ERPNotification) => {
    markRead(n.id);
    router.push(n.link);
    onClose();
  };

  const handleViewAll = () => {
    router.push('/erp/notifications');
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/98 backdrop-blur-[12px] border border-border rounded-xl shadow-xl z-50 max-w-[calc(100vw-1rem)]">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="font-semibold text-sm">
          Notifications {unreadCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs h-6 text-primary hover:text-sw-green-700" onClick={markAllRead}>
            <Check className="h-3 w-3 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-80">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
            <Bell className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">All clear — no active alerts</p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = severityIcon[n.severity];
            return (
              <div
                key={n.id}
                className={`p-3 border-b border-border last:border-b-0 flex gap-3 transition-colors duration-150 ${severityBorderColor[n.severity]} ${!n.is_read ? 'bg-white' : 'bg-transparent'}`}
              >
                <button onClick={() => handleClick(n)} className="flex gap-3 flex-1 min-w-0 text-left hover:bg-sw-green-50/60 transition-colors rounded">
                  <div className="relative shrink-0">
                    <Icon className={`h-4 w-4 mt-0.5 ${severityColor[n.severity]}`} />
                    {!n.is_read && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {n.title && (
                      <p className={`text-xs font-bold mb-0.5 ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {n.title}
                      </p>
                    )}
                    <p className={`text-xs leading-relaxed ${!n.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {n.message}
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => dismiss(n.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </ScrollArea>

      <div className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-primary hover:text-sw-green-700 gap-1.5"
          onClick={handleViewAll}
        >
          <ExternalLink className="h-3.5 w-3.5" /> View all notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;
