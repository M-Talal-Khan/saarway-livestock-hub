import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

export async function GET(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const d = new Date();
    const currentPeriod = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().split('T')[0];

    // Parallel queries
    const [farmsRes, requestsRes, listingsRes, messagesRes, recentFarmsRes, billingRes] = await Promise.all([
        admin.from("farms").select("id", { count: "exact" }),
        admin.from("farm_requests").select("id", { count: "exact" }).eq("status", "pending"),
        admin.from("listings").select("id", { count: "exact" }).eq("status", "active"),
        admin.from("contact_messages").select("id, user_type, name, message, created_at, status").order("created_at", { ascending: false }).limit(5),
        admin.from("farms").select("id, farm_name, farm_number, onboarded_at").eq("is_active", true).order("onboarded_at", { ascending: false }).limit(5),
        admin.from("farm_billing").select("farm_id, amount_owed, status, billing_period"),
    ]);

    const totalFarms = farmsRes.count ?? 0;
    const pendingRequests = requestsRes.count ?? 0;
    const activeListings = listingsRes.count ?? 0;

    const currentMonthBills = (billingRes.data ?? []).filter(b => b.billing_period === currentPeriod);
    const estimatedRevenue = currentMonthBills.reduce((sum, b) => sum + Number(b.amount_owed), 0);
    const unpaidBills = (billingRes.data ?? []).filter(b => b.status === 'unpaid');
    const recentMessages = (messagesRes.data ?? []).map(m => ({
        id: m.id,
        sender: m.name,
        type: m.user_type,
        preview: m.message.length > 60 ? m.message.slice(0, 60) + "..." : m.message,
        date: new Date(m.created_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" }),
        status: m.status,
    }));

    const unreadMessages = (messagesRes.data ?? []).filter(m => m.status === "Unread").length;

    // Build dynamic alerts
    const alerts: { severity: string; message: string; time: string; link: string }[] = [];

    if (pendingRequests > 0) {
        alerts.push({
            severity: "info",
            message: `${pendingRequests} pending farm registration${pendingRequests > 1 ? "s" : ""} awaiting review`,
            time: "Now",
            link: "/super-admin/farms",
        });
    }

    if (unreadMessages > 0) {
        alerts.push({
            severity: "info",
            message: `${unreadMessages} unread contact message${unreadMessages > 1 ? "s" : ""}`,
            time: "Now",
            link: "/super-admin/messages",
        });
    }

    if (unpaidBills.length > 0) {
        alerts.push({
            severity: "warning",
            message: `${unpaidBills.length} unpaid revenue bill${unpaidBills.length > 1 ? "s" : ""} from farms`,
            time: "Recent",
            link: "/super-admin/revenue",
        });
    }

    const recentApprovals = (recentFarmsRes.data ?? []).map(f => ({
        farmName: f.farm_name,
        farmId: `F${String(f.farm_number).padStart(3, "0")}`,
        date: f.onboarded_at ? new Date(f.onboarded_at).toLocaleDateString("en-PK", { month: "short", day: "numeric" }) : "—",
    }));

    return NextResponse.json({
        stats: { totalFarms, pendingRequests, activeListings, estimatedRevenue },
        recentAlerts: alerts.slice(0, 5),
        recentMessages: recentMessages.slice(0, 3),
        recentApprovals: recentApprovals.slice(0, 5),
    });
}
