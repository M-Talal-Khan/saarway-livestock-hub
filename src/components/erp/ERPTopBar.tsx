"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, MapPin, LogOut, ChevronDown, User, Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import NotificationPanel from './NotificationPanel';

const ERPTopBar = () => {
  const { currentFarm, currentUser, currentStation, stationSelected, clearStation, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const isAdmin = currentUser?.role === 'Admin';

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  return (
    <header className="h-14 border-b border-border/50 bg-white/70 backdrop-blur-xl flex items-center px-3 sm:px-6 gap-2 sm:gap-3 shrink-0 shadow-[0_1px_12px_rgba(0,0,0,0.04)] sticky top-0 z-30 transition-all duration-300">
      {stationSelected && <SidebarTrigger className="mr-1 hover:bg-primary/10 transition-colors duration-200 shrink-0" />}

      {/* Farm & Station name */}
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="font-semibold text-sm text-foreground truncate max-w-[120px] sm:max-w-none">
          {currentFarm?.name || 'Saarway ERP'}
        </span>
        {currentStation && (
          <>
            <span className="text-muted-foreground text-xs shrink-0">·</span>
            <span className="text-xs text-muted-foreground truncate flex items-center gap-1 shrink-0">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle inline-block" />
              <span className="hidden sm:inline">{currentStation.name}</span>
            </span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hover:bg-primary/10 transition-all duration-200"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${notifOpen ? 'scale-110 text-primary' : 'hover:scale-105'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse-subtle">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Change Station — Admin only, after station selected */}
        {isAdmin && stationSelected && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_12px_rgba(61,184,61,0.15)] transition-all duration-300"
            onClick={() => {
              clearStation();
              router.push('/erp/stations-overview');
            }}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Change Station</span>
          </Button>
        )}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 sm:gap-2 text-xs hover:bg-primary/10 transition-all duration-200 px-2 sm:px-3">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-sw-green-700 flex items-center justify-center shrink-0">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="hidden sm:inline max-w-[100px] truncate">{currentUser?.fullName || 'User'}</span>
              <ChevronDown className="h-3 w-3 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-white/98 backdrop-blur-xl border-border/50 shadow-xl">
            <DropdownMenuLabel className="text-xs">
              <div className="font-semibold truncate">{currentUser?.fullName}</div>
              <div className="text-muted-foreground font-normal">{currentUser?.role}</div>
              <div className="text-muted-foreground font-normal text-[10px] truncate">{currentFarm?.name}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && (
              <DropdownMenuItem onClick={() => router.push('/erp/settings')} className="transition-colors">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => router.push('/erp/notifications')}
              className="transition-colors"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => { logout(); router.push('/'); }}
              className="text-destructive hover:!bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ERPTopBar;
