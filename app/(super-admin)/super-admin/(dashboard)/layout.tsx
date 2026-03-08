"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSuperAdminAuth } from "@/context/SuperAdminAuthContext";
import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar";
import SuperAdminTopBar from "@/components/super-admin/SuperAdminTopBar";

export default function SuperAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useSuperAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/super-admin");
    }
  }, [loading, isAuthenticated, router]);

  // Avoid flash-redirect while Supabase session is being resolved
  if (loading || !isAuthenticated) return null;

  return (
    <div className="flex min-h-screen w-full">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <SuperAdminTopBar />
        <main className="flex-1 bg-[#f0f4f8] p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
