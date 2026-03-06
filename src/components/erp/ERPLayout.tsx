import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import ERPSidebar from './ERPSidebar';
import ERPTopBar from './ERPTopBar';

const ERPLayout = () => {
  const { currentUser, stationSelected } = useAuth();
  const location = useLocation();

  const isAdmin = currentUser?.role === 'Admin';
  const onStationsPage = location.pathname === '/erp/stations-overview';

  // Admin without station selected → force to stations overview
  if (isAdmin && !stationSelected && !onStationsPage) {
    return <Navigate to="/erp/stations-overview" replace />;
  }

  const showSidebar = stationSelected;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-sw-green-50">
        {showSidebar && <ERPSidebar />}
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
