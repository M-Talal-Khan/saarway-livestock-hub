import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
