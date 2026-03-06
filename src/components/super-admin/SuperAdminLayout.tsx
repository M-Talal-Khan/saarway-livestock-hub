import { Outlet, Navigate } from "react-router-dom";
import { useSuperAdminAuth } from "@/context/SuperAdminAuthContext";
import SuperAdminSidebar from "./SuperAdminSidebar";
import SuperAdminTopBar from "./SuperAdminTopBar";

const SuperAdminLayout = () => {
  const { isAuthenticated } = useSuperAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/super-admin" replace />;
  }

  return (
    <div className="flex min-h-screen w-full">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <SuperAdminTopBar />
        <main className="flex-1 bg-[#f0f4f8] p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
