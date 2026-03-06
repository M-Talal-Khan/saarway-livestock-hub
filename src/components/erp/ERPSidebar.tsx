import { useLocation, useNavigate } from 'react-router-dom';
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
  { title: 'Feed & Inventory', icon: Wheat, url: '/erp/feed', disabled: true, comingSoon: true, roles: ['Admin', 'Manager'] },
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
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const role = currentUser?.role || 'Admin';

  const visibleModules = modules.filter(m => m.roles.includes(role) || m.comingSoon);

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-white">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SW</span>
            </div>
            <span className="font-bold text-foreground">Saarway ERP</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">SW</span>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleModules.map((item) => {
                const isActive = location.pathname === item.url;
                const isAllowed = item.roles.includes(role);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={() => {
                        if (!item.disabled && isAllowed) navigate(item.url);
                      }}
                      className={`
                        rounded-lg transition-colors duration-200
                        ${isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'hover:bg-sw-green-100'
                        }
                        ${item.disabled || !isAllowed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {item.disabled ? <Lock className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                      {!collapsed && (
                        <span className="flex items-center gap-2">
                          {item.title}
                          {item.comingSoon && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>
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
