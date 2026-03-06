import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Bell, MapPin, LogOut, ChevronDown, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import NotificationPanel from './NotificationPanel';

const ERPTopBar = () => {
  const { currentFarm, currentUser, currentStation, stationSelected, clearStation, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-white flex items-center px-6 gap-3 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      {stationSelected && <SidebarTrigger className="mr-1" />}

      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-sm text-foreground truncate">{currentFarm?.name || 'GRASS Farms'}</span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-sm text-muted-foreground truncate">
          {currentStation ? currentStation.name : 'No station selected'}
        </span>
      </div>

      {stationSelected && (
        <div className="ml-auto flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative h-9 w-9" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse-subtle">4</span>
            </Button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>

          {/* Change Station — Admin only */}
          {currentUser?.role === 'Admin' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-primary text-primary hover:bg-sw-green-50 hover:border-sw-green-700"
              onClick={() => {
                clearStation();
                navigate('/erp/stations-overview');
              }}
            >
              <MapPin className="h-3.5 w-3.5" />
              Change Station
            </Button>
          )}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{currentUser?.fullName || 'User'}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="text-xs">
                <div>{currentUser?.fullName}</div>
                <div className="text-muted-foreground font-normal">{currentUser?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); navigate('/'); }} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
};

export default ERPTopBar;
