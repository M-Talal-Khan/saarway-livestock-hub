"use client";

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, AppRole } from '@/context/AuthContext';
import {
  Home, Beef, Wheat, Syringe, ShoppingCart, Banknote, BarChart3,
  Store, TrendingUp, Users, Settings, Lock, Bell, ClipboardList
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
  { title: 'Tasks', icon: ClipboardList, url: '/erp/tasks', roles: ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer', 'Worker'] },
  { title: 'Reports', icon: TrendingUp, url: '/erp/reports', roles: ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer'] },
  { title: 'Notifications', icon: Bell, url: '/erp/notifications', roles: ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer', 'Worker'] },
  { title: 'User Management', icon: Users, url: '/erp/users', roles: ['Admin'] },
  { title: 'Settings', icon: Settings, url: '/erp/settings', roles: ['Admin'] },
];

const ERPSidebar = () => {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { state, isMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;
  const role = currentUser?.role || 'Admin';

  const visibleModules = modules.filter(m => m.roles.includes(role) || m.comingSoon);

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-[#0a1a0a] text-white [&_[data-sidebar]]:bg-[#0a1a0a]">
      <SidebarHeader className={`border-b border-white/10 ${collapsed ? 'p-3 flex items-center justify-center' : 'p-5'}`}>
        <div className="flex items-center gap-2.5">
          <Image src="/images/logo-icon-v2.png" alt="Saarway" width={32} height={32} className="shrink-0" />
          {!collapsed && (
            <span className="font-bold text-white text-sm tracking-wide sw-fade-in">Saarway ERP</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 [&_*]:border-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleModules.map((item, index) => {
                const isActive = pathname === item.url;
                const isAllowed = item.roles.includes(role);
                return (
                  <SidebarMenuItem key={item.title} style={{ animationDelay: `${index * 40}ms` }} className="sw-slide-in">
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={() => {
                        if (!item.disabled && isAllowed) router.push(item.url);
                      }}
                      className={`
                        rounded-lg transition-all duration-300 py-2.5 group/btn relative overflow-hidden
                        ${collapsed ? 'justify-center px-0' : ''}
                        ${isActive
                          ? 'bg-gradient-to-r from-primary/30 to-primary/10 !text-white shadow-[0_0_20px_rgba(61,184,61,0.15)] border-l-[3px] border-l-primary'
                          : 'hover:bg-white/8 text-white/60 hover:text-white border-l-[3px] border-l-transparent'
                        }
                        ${item.disabled || !isAllowed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {isActive && (
                        <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent animate-pulse-subtle pointer-events-none" />
                      )}
                      <span className={`relative z-10 flex items-center justify-center shrink-0 transition-all duration-300 ${isActive
                        ? 'text-primary drop-shadow-[0_0_8px_rgba(61,184,61,0.6)]'
                        : 'text-white/50 group-hover/btn:text-white/90'
                        } ${collapsed ? 'w-5 h-5 mx-auto' : 'w-4 h-4'}`}>
                        {item.disabled ? <Lock className="h-full w-full" /> : <item.icon className="h-full w-full" />}
                      </span>
                      {!collapsed && (
                        <span className="relative z-10 flex items-center gap-2 text-sm font-medium">
                          {item.title}
                          {item.comingSoon && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-white/10 text-white/70 border-0">Soon</Badge>
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
