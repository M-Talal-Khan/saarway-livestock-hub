import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import ERPSidebar from './ERPSidebar';
import ERPTopBar from './ERPTopBar';

const ERPLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-sw-green-50">
        <ERPSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <ERPTopBar />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ERPLayout;
