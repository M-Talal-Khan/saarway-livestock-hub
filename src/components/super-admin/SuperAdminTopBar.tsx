"use client";

import { Bell, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSuperAdminAuth } from "@/context/SuperAdminAuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const SuperAdminTopBar = () => {
  const { logout } = useSuperAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/super-admin");
  };

  return (
    <header className="h-14 bg-white border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between px-6">
      <h2 className="text-sm font-semibold text-foreground">Super Admin Panel</h2>
      <div className="flex items-center gap-3">
        <Link href="/super-admin/alerts" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-sw-admin-err text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse-subtle">
            3
          </span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default SuperAdminTopBar;
