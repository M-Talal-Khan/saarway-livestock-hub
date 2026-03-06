import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SuperAdminAuthProvider } from "@/context/SuperAdminAuthContext";

import PublicLayout from "@/components/layout/PublicLayout";
import ERPLayout from "@/components/erp/ERPLayout";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Farms from "./pages/Farms";
import FarmDetail from "./pages/FarmDetail";
import Marketplace from "./pages/Marketplace";
import ListingDetail from "./pages/ListingDetail";
import Contact from "./pages/Contact";
import RegisterFarm from "./pages/RegisterFarm";
import Login from "./pages/Login";
import FarmLogin from "./pages/FarmLogin";
import NotFound from "./pages/NotFound";

import StationsOverview from "./pages/erp/StationsOverview";
import Dashboard from "./pages/erp/Dashboard";
import CattleManagement from "./pages/erp/CattleManagement";
import FeedInventory from "./pages/erp/FeedInventory";
import HealthVaccination from "./pages/erp/HealthVaccination";
import Buying from "./pages/erp/Buying";
import Selling from "./pages/erp/Selling";
import FinanceRent from "./pages/erp/FinanceRent";
import MarketplaceManagement from "./pages/erp/MarketplaceManagement";
import Reports from "./pages/erp/Reports";
import UserManagement from "./pages/erp/UserManagement";
import SettingsPage from "./pages/erp/Settings";

import SuperAdminLogin from "./pages/super-admin/Login";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import FarmManagement from "./pages/super-admin/FarmManagement";
import MarketplaceOverview from "./pages/super-admin/MarketplaceOverview";
import Revenue from "./pages/super-admin/Revenue";
import Analytics from "./pages/super-admin/Analytics";
import Messages from "./pages/super-admin/Messages";
import Alerts from "./pages/super-admin/Alerts";
import PlatformSettings from "./pages/super-admin/PlatformSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SuperAdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/farms" element={<Farms />} />
                <Route path="/farms/:id" element={<FarmDetail />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/marketplace/:id" element={<ListingDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/register-farm" element={<RegisterFarm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/farm-login" element={<FarmLogin />} />
              </Route>
              <Route path="/erp" element={<ERPLayout />}>
                <Route path="stations-overview" element={<StationsOverview />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="cattle" element={<CattleManagement />} />
                <Route path="feed" element={<FeedInventory />} />
                <Route path="health" element={<HealthVaccination />} />
                <Route path="buying" element={<Buying />} />
                <Route path="selling" element={<Selling />} />
                <Route path="finance" element={<FinanceRent />} />
                <Route path="marketplace" element={<MarketplaceManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/super-admin" element={<SuperAdminLogin />} />
              <Route path="/super-admin" element={<SuperAdminLayout />}>
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="farms" element={<FarmManagement />} />
                <Route path="marketplace" element={<MarketplaceOverview />} />
                <Route path="revenue" element={<Revenue />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="messages" element={<Messages />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="settings" element={<PlatformSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SuperAdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
