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
  const { isAuthenticated } = useSuperAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/super-admin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

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
