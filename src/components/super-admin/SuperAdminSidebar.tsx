"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Store, DollarSign,
  BarChart3, MessageSquare, Bell, Settings
} from "lucide-react";

const modules = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/super-admin/dashboard" },
  { title: "Farm Management", icon: Building2, path: "/super-admin/farms" },
  { title: "Marketplace", icon: Store, path: "/super-admin/marketplace" },
  { title: "Revenue", icon: DollarSign, path: "/super-admin/revenue" },
  { title: "Analytics", icon: BarChart3, path: "/super-admin/analytics" },
  { title: "Messages", icon: MessageSquare, path: "/super-admin/messages" },
  { title: "Alerts", icon: Bell, path: "/super-admin/alerts" },
  { title: "Settings", icon: Settings, path: "/super-admin/settings" },
];

const SuperAdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-sw-admin-bg flex flex-col">
      <div className="p-5 border-b border-sw-admin-mid">
        <h1 className="text-xl font-bold text-white tracking-tight">SAARWAY</h1>
        <p className="text-xs text-sw-admin-blue mt-0.5">Super Admin</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {modules.map((mod) => {
          const active = pathname === mod.path;
          return (
            <Link
              key={mod.path}
              href={mod.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sw-admin-mid text-white border-l-[3px] border-sw-admin-green"
                  : "text-sw-admin-blue hover:bg-sw-admin-mid hover:text-white border-l-[3px] border-transparent"
              }`}
            >
              <mod.icon className="h-4 w-4 shrink-0" />
              <span>{mod.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar;
