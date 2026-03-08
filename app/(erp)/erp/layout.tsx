"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import ERPSidebar from "@/components/erp/ERPSidebar";
import ERPTopBar from "@/components/erp/ERPTopBar";

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, stationSelected } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = currentUser?.role === "Admin";
  const onStationsPage = pathname === "/erp/stations-overview";

  useEffect(() => {
    // Not a farm user → redirect to farm login
    if (!currentUser) {
      router.replace("/farm-login");
      return;
    }
    // Admin must pick a station before accessing any other ERP page
    if (isAdmin && !stationSelected && !onStationsPage) {
      router.replace("/erp/stations-overview");
    }
  }, [currentUser, isAdmin, stationSelected, onStationsPage, router]);

  // Blank while redirecting
  if (!currentUser) return null;
  if (isAdmin && !stationSelected && !onStationsPage) return null;

  const showSidebar = !isAdmin || stationSelected;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-sw-green-50 via-white to-sw-green-50/60">
        {showSidebar && <ERPSidebar />}
        <div className="flex-1 flex flex-col min-w-0">
          <ERPTopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
