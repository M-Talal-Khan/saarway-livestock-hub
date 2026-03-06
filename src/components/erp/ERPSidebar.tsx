"use client";

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, AppRole } from '@/context/AuthContext';
import {
  Home, Beef, Wheat, Syringe, ShoppingCart, Banknote, BarChart3,
  Store, TrendingUp, Users, Settings, Lock
} from 'lucide-react';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

interface ModuleItem {
  title: string;
  icon: React.ElementType;
  url: string;
  disabled?: boolean;
  comingSoon?: boolean;
  roles: AppRole[];
}

const modules: ModuleItem[] = [
  { title: 'Dashboard', icon: Home, url: '/erp/dashboard', roles: ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer', 'Worker'] },
  { title: 'Cattle Management', icon: Beef, url: '/erp/cattle', roles: ['Admin', 'Manager', 'Veterinarian', 'Worker'] },
  { title: 'Feed & Inventory', icon: Wheat, url: '/erp/feed', roles: ['Admin', 'Manager', 'Worker'] },
  { title: 'Health & Vaccination', icon: Syringe, url: '/erp/health', roles: ['Admin', 'Manager', 'Veterinarian'] },
  { title: 'Buying', icon: ShoppingCart, url: '/erp/buying', roles: ['Admin', 'Manager'] },
  { title: 'Selling', icon: Banknote, url: '/erp/selling', roles: ['Admin', 'Manager'] },
  { title: 'Finance & Rent', icon: BarChart3, url: '/erp/finance', roles: ['Admin', 'Accounts Officer'] },
  { title: 'Marketplace', icon: Store, url: '/erp/marketplace', roles: ['Admin', 'Manager'] },
  { title: 'Reports', icon: TrendingUp, url: '/erp/reports', roles: ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer'] },
  { title: 'User Management', icon: Users, url: '/erp/users', roles: ['Admin'] },
  { title: 'Settings', icon: Settings, url: '/erp/settings', roles: ['Admin'] },
];

const ERPSidebar = () => {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const role = currentUser?.role || 'Admin';

  const visibleModules = modules.filter(m => m.roles.includes(role) || m.comingSoon);

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-white">
      <SidebarHeader className="p-5 border-b border-border">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo-icon.png" alt="Saarway" width={32} height={32} />
            <span className="font-bold text-foreground text-sm">Saarway ERP</span>
          </div>
        ) : (
          <div className="mx-auto">
            <Image src="/images/logo-icon.png" alt="Saarway" width={32} height={32} />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {visibleModules.map((item) => {
                const isActive = pathname === item.url;
                const isAllowed = item.roles.includes(role);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={() => {
                        if (!item.disabled && isAllowed) router.push(item.url);
                      }}
                      className={`
                        rounded-lg transition-all duration-200 py-2.5
                        ${isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-l-[3px] border-l-sw-green-700'
                          : 'hover:bg-sw-green-100 text-muted-foreground hover:text-foreground border-l-[3px] border-l-transparent'
                        }
                        ${item.disabled || !isAllowed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {item.disabled ? <Lock className="h-4 w-4 shrink-0" /> : <item.icon className="h-4 w-4 shrink-0" />}
                      {!collapsed && (
                        <span className="flex items-center gap-2 text-sm font-medium">
                          {item.title}
                          {item.comingSoon && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Soon</Badge>
                          )}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default ERPSidebar;
