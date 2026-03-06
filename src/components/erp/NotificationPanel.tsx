import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { erpNotifications, ERPNotification } from '@/data/erp/notifications';
import { AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const severityIcon: Record<string, React.ElementType> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityBorderColor: Record<string, string> = {
  critical: 'border-l-[3px] border-l-destructive',
  warning: 'border-l-[3px] border-l-accent',
  info: 'border-l-[3px] border-l-sw-sky-400',
};

const severityColor: Record<string, string> = {
  critical: 'text-destructive',
  warning: 'text-accent',
  info: 'text-sw-sky-400',
};

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const [notifications, setNotifications] = useState(erpNotifications);
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClick = (n: ERPNotification) => {
    markRead(n.id);
    if (n.link) navigate(n.link);
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-[12px] border border-border rounded-xl shadow-xl z-50">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="font-semibold text-sm">Notifications ({unread})</span>
        <Button variant="ghost" size="sm" className="text-xs h-6 text-primary hover:text-sw-green-700" onClick={markAllRead}>
          <Check className="h-3 w-3 mr-1" /> Mark all read
        </Button>
      </div>
      <ScrollArea className="max-h-80">
        {notifications.map(n => {
          const Icon = severityIcon[n.severity];
          return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left p-3 hover:bg-sw-green-50 border-b border-border last:border-b-0 flex gap-3 transition-colors duration-150 ${severityBorderColor[n.severity]} ${!n.read ? 'bg-white' : 'bg-transparent'}`}
            >
              <div className="relative shrink-0">
                <Icon className={`h-4 w-4 mt-0.5 ${severityColor[n.severity]}`} />
                {!n.read && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-xs leading-relaxed ${!n.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
              </div>
            </button>
          );
        })}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;
