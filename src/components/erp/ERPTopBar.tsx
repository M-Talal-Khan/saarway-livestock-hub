"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, MapPin, LogOut, ChevronDown, User } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import NotificationPanel from './NotificationPanel';

const ERPTopBar = () => {
  const { currentFarm, currentUser, currentStation, stationSelected, clearStation, logout } = useAuth();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border/50 bg-white/70 backdrop-blur-xl flex items-center px-6 gap-3 shrink-0 shadow-[0_1px_12px_rgba(0,0,0,0.04)] sticky top-0 z-30 transition-all duration-300">
      {stationSelected && <SidebarTrigger className="mr-1 hover:bg-primary/10 transition-colors duration-200" />}

      <div className="flex items-center gap-2 min-w-0">
        <span className="font-semibold text-sm text-foreground truncate">{currentFarm?.name || 'GRASS Farms'}</span>
        <span className="text-muted-foreground text-xs">·</span>
        <span className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle inline-block" />
          {currentStation ? currentStation.name : 'No station selected'}
        </span>
      </div>

      {stationSelected && (
        <div className="ml-auto flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-primary/10 transition-all duration-200" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${notifOpen ? 'scale-110 text-primary' : 'hover:scale-105'}`} />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse-subtle">4</span>
            </Button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>

          {/* Change Station — Admin only */}
          {currentUser?.role === 'Admin' && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_12px_rgba(61,184,61,0.15)] transition-all duration-300"
              onClick={() => {
                clearStation();
                router.push('/erp/stations-overview');
              }}
            >
              <MapPin className="h-3.5 w-3.5" />
              Change Station
            </Button>
          )}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs hover:bg-primary/10 transition-all duration-200">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-sw-green-700 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="hidden md:inline">{currentUser?.fullName || 'User'}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-xl border-border/50 shadow-xl">
              <DropdownMenuLabel className="text-xs">
                <div>{currentUser?.fullName}</div>
                <div className="text-muted-foreground font-normal">{currentUser?.role}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { logout(); router.push('/'); }} className="text-destructive hover:!bg-destructive/10 transition-colors">
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
