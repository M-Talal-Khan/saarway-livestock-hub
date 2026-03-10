import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdminSession } from "@/lib/supabase/super-admin-session";

const SUB_FEE_PER_ANIMAL = 50;
const LIST_FEE_PER_LISTING = 50;

// Helper to get the first day of the current month
const getCurrentPeriod = () => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().split('T')[0];
};

export async function GET(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    // Fetch all billing records, joining with farms to get farm names
    const { data: billingRecords, error } = await admin
        .from("farm_billing")
        .select(`
            id,
            billing_period,
            animals_count,
            previous_animals,
            new_animals,
            removed_animals,
            listings_count,
            amount_owed,
            amount_paid,
            status,
            farm_id,
            farms ( farm_name, owner_name, email, phone, city )
        `)
        .order("billing_period", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const formattedRecords = (billingRecords ?? []).map(r => {
        const farm = r.farms as unknown as { farm_name: string, owner_name: string | null, email: string | null, phone: string | null, city: string | null } | null;
        return {
            id: r.id,
            farm_id: r.farm_id,
            farmName: farm?.farm_name ?? "Unknown Farm",
            ownerName: farm?.owner_name ?? "Unknown Owner",
            email: farm?.email ?? "",
            phone: farm?.phone ?? "",
            city: farm?.city ?? "Unknown City",
            period: new Date(r.billing_period).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            animals: r.animals_count,
            previousAnimals: r.previous_animals ?? 0,
            newAnimals: r.new_animals ?? 0,
            removedAnimals: r.removed_animals ?? 0,
            listings: r.listings_count,
            owed: r.amount_owed,
            paid: r.amount_paid,
            balance: r.amount_owed - r.amount_paid,
            status: r.status,
            rawPeriod: r.billing_period,
        };
    });

    const totalOwed = formattedRecords.reduce((sum, r) => sum + r.owed, 0);
    const totalPaid = formattedRecords.reduce((sum, r) => sum + r.paid, 0);
    const totalBalance = totalOwed - totalPaid;

    return NextResponse.json({
        records: formattedRecords,
        totalOwed,
        totalPaid,
        totalBalance
    });
}

// Action: Calculate current month's revenue and create/update billing records
export async function POST(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const currentPeriod = getCurrentPeriod();

    // 1. Fetch active farms, cattle, listings, and platform settings
    const [{ data: farms }, { data: allCattle }, { data: allListings }, { data: settings }] = await Promise.all([
        admin.from("farms").select("id").eq("is_active", true),
        admin.from("cattle").select("farm_id, status, created_at, updated_at"),
        admin.from("listings").select("farm_id").eq("status", "active"),
        admin.from("platform_settings").select("sub_fee_per_animal, list_fee_per_listing").eq("id", 1).single()
    ]);

    const SUB_FEE_PER_ANIMAL = settings?.sub_fee_per_animal ?? 50;
    const LIST_FEE_PER_LISTING = settings?.list_fee_per_listing ?? 50;

    const farmMap = new Map<string, { animals: number; previous_animals: number; new_animals: number; removed_animals: number; listings: number }>();
    (farms ?? []).forEach(f => farmMap.set(f.id, { animals: 0, previous_animals: 0, new_animals: 0, removed_animals: 0, listings: 0 }));

    (allCattle ?? []).forEach(c => {
        const entry = farmMap.get(c.farm_id);
        if (!entry) return;

        const isNew = c.created_at >= currentPeriod;
        const isRemoved = ['sold', 'slaughtered', 'dead'].includes(c.status);
        const removedThisPeriod = isRemoved && c.updated_at >= currentPeriod;
        const activeBeforePeriod = c.created_at < currentPeriod && (!isRemoved || (isRemoved && c.updated_at >= currentPeriod));

        if (activeBeforePeriod) entry.previous_animals++;
        if (isNew) entry.new_animals++;
        if (removedThisPeriod) entry.removed_animals++;
        if (!isRemoved) entry.animals++;
    });

    (allListings ?? []).forEach(l => {
        const entry = farmMap.get(l.farm_id);
        if (entry) entry.listings++;
    });

    // 2. Upsert billing records
    const upserts = [...farmMap.entries()].map(([farmId, counts]) => {
        const owed = Number((counts.animals * SUB_FEE_PER_ANIMAL) + (counts.listings * LIST_FEE_PER_LISTING));
        return {
            farm_id: farmId,
            billing_period: currentPeriod,
            animals_count: counts.animals,
            previous_animals: counts.previous_animals,
            new_animals: counts.new_animals,
            removed_animals: counts.removed_animals,
            listings_count: counts.listings,
            amount_owed: owed,
            updated_at: new Date().toISOString()
            // amount_paid and status will default on insert or remain untouched via trigger if we used one,
            // but for simplicity via Supabase JS upsert, if we don't include amount_paid, it might be overwritten if we're not careful.
            // A safer approach: fetch existing records for this period first.
        };
    });

    const { data: existingRecords } = await admin
        .from("farm_billing")
        .select("id, farm_id, amount_paid")
        .eq("billing_period", currentPeriod);

    const existingMap = new Map((existingRecords ?? []).map(r => [r.farm_id, r]));

    const finalUpserts = upserts.map(u => {
        const existing = existingMap.get(u.farm_id);
        const paid = existing ? existing.amount_paid : 0;
        const status = paid >= u.amount_owed ? "paid" : (paid > 0 ? "partial" : "unpaid");

        return {
            ...u,
            ...(existing ? { id: existing.id } : {}),
            amount_paid: paid,
            status
        };
    });

    const { error } = await admin.from("farm_billing").upsert(finalUpserts, { onConflict: "farm_id, billing_period" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Check if we actually inserted new records or just updated existing ones
    const isAlreadyCalculated = existingRecords && existingRecords.length > 0 && existingRecords.length === farms?.length;

    return NextResponse.json({ success: true, count: finalUpserts.length, alreadyCalculated: isAlreadyCalculated });
}

// Action: Mark a record as paid
export async function PATCH(request: NextRequest) {
    const authorized = await verifySuperAdminSession(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, amount_paid } = await request.json();
        if (!id || amount_paid === undefined) return NextResponse.json({ error: "Missing id or amount_paid" }, { status: 400 });

        const admin = createAdminClient();

        // Get current record to determine status and validate amount
        const { data: record, error: fetchErr } = await admin.from("farm_billing").select("amount_owed").eq("id", id).single();
        if (fetchErr || !record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        if (amount_paid > record.amount_owed) {
            return NextResponse.json({ error: "Cannot pay more than the total amount owed" }, { status: 400 });
        }

        const status = amount_paid >= record.amount_owed ? "paid" : (amount_paid > 0 ? "partial" : "unpaid");

        const { error } = await admin
            .from("farm_billing")
            .update({ amount_paid, status, updated_at: new Date().toISOString() })
            .eq("id", id);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
