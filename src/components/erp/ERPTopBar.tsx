import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/context/AuthContext';
import { Bell, MapPin, LogOut, ChevronDown, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotificationPanel from './NotificationPanel';

const roles: AppRole[] = ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer', 'Worker'];

const ERPTopBar = () => {
  const { currentFarm, currentUser, currentStation, setRole, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0">
      <SidebarTrigger className="mr-2" />

      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-foreground truncate">{currentFarm?.name || 'GRASS Farms'}</span>
        {currentStation && (
          <>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground truncate">{currentStation.name}</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Demo Role Switcher */}
        <Select value={currentUser?.role || 'Admin'} onValueChange={(v) => setRole(v as AppRole)}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Notification Bell */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(!notifOpen)}>
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">4</span>
          </Button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Change Station */}
        {currentUser?.role === 'Admin' && (
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => navigate('/erp/stations-overview')}>
            <MapPin className="h-3 w-3" />
            Change Station
          </Button>
        )}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{currentUser?.fullName || 'Admin'}</span>
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
    </header>
  );
};

export default ERPTopBar;
