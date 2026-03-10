"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

/**
 * Floating pill that appears for logged-in farm users
 * whenever they navigate away from the ERP section.
 */
export default function FloatingErpButton() {
    const { currentUser } = useAuth();
    const pathname = usePathname();

    // Only show for farm users on non-ERP pages
    if (!currentUser || pathname.startsWith("/erp")) return null;

    return (
        <Link
            href="/erp/dashboard"
            className="
        fixed bottom-6 right-6 z-50
        flex items-center gap-2
        bg-primary text-primary-foreground
        shadow-lg shadow-primary/25
        rounded-full px-4 py-3
        text-sm font-semibold
        hover:scale-105 hover:shadow-xl hover:shadow-primary/30
        active:scale-95
        transition-all duration-200 ease-out
        animate-in fade-in slide-in-from-bottom-4
      "
            title="Return to ERP Dashboard"
        >
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden sm:inline">Back to ERP</span>
        </Link>
    );
}
