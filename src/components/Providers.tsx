"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { SuperAdminAuthProvider } from "@/context/SuperAdminAuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import FloatingErpButton from "@/components/FloatingErpButton";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SuperAdminAuthProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <FloatingErpButton />
            {children}
          </AuthProvider>
        </SuperAdminAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
