module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/supabase/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
function createAdminClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://jmxitiocgsqpksnceoyd.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
}
}),
"[project]/src/lib/supabase/farm-session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "stationFilter",
    ()=>stationFilter,
    "verifyFarmSession",
    ()=>verifyFarmSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/admin.ts [app-route] (ecmascript)");
;
async function verifyFarmSession(request) {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const { data } = await admin.from("farm_user_sessions").select("farm_user_id, farm_id, role, station_id, expires_at").eq("session_token", token).gt("expires_at", new Date().toISOString()).single();
    if (!data) return null;
    return {
        farm_user_id: data.farm_user_id,
        farm_id: data.farm_id,
        role: data.role,
        station_id: data.station_id ?? null
    };
}
function stationFilter(session) {
    if (session.role === "admin" || session.role === "accounts") return {};
    if (session.station_id) return {
        station_id: session.station_id
    };
    return {};
}
}),
"[project]/app/api/erp/sales/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/farm-session.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyFarmSession"])(request);
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const sf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["stationFilter"])(session);
    let query = admin.from("sales").select(`id, sale_type, buyer_name, buyer_phone, slaughterhouse, meat_weight_kg, price_per_kg, total_price, sale_date, notes, station_id, stations(station_name, station_tag), sale_items(id, cattle_id, individual_price)`).eq("farm_id", session.farm_id).order("sale_date", {
        ascending: false
    });
    if (sf.station_id) query = query.eq("station_id", sf.station_id);
    const { data, error } = await query;
    if (error) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: error.message
    }, {
        status: 500
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        sales: data ?? []
    });
}
async function POST(request) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyFarmSession"])(request);
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    if (![
        "admin",
        "manager",
        "accounts"
    ].includes(session.role)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Forbidden"
        }, {
            status: 403
        });
    }
    const body = await request.json();
    const { stationId, saleType, buyerName, buyerPhone, slaughterhouse, meatWeightKg, pricePerKg, totalPrice, saleDate, notes, animals } = body;
    if (!stationId || !saleType || !totalPrice || !saleDate || !Array.isArray(animals) || animals.length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing required fields"
        }, {
            status: 400
        });
    }
    // Deduplicate cattle IDs (guard against double-submission of same animal)
    const cattleIds = [
        ...new Set(animals.map((a)=>a.cattleId))
    ];
    if (cattleIds.length !== animals.length) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Duplicate animals in the sale — each animal can only appear once"
        }, {
            status: 400
        });
    }
    // Validate sum of individual prices (allow ±1 PKR rounding tolerance)
    const priceSum = animals.reduce((sum, a)=>sum + Number(a.price), 0);
    if (Math.abs(priceSum - Number(totalPrice)) > 1) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Sum of individual prices must equal total price"
        }, {
            status: 400
        });
    }
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    // ── Step 1: Verify cattle exist in farm & are sellable ────────────────────
    const { data: cattleRows } = await admin.from("cattle").select("id, status").in("id", cattleIds).eq("farm_id", session.farm_id);
    if (!cattleRows || cattleRows.length !== cattleIds.length) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "One or more animals not found in this farm"
        }, {
            status: 400
        });
    }
    const alreadySold = cattleRows.filter((c)=>[
            "sold",
            "slaughtered",
            "dead"
        ].includes(c.status));
    if (alreadySold.length > 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Cannot sell animals that are already sold, slaughtered, or dead"
        }, {
            status: 400
        });
    }
    // ── Step 2: Check for orphaned sale_items (previous partial failures) ──────
    const { data: existingItems } = await admin.from("sale_items").select("cattle_id").in("cattle_id", cattleIds);
    if (existingItems && existingItems.length > 0) {
        // Auto-fix: mark orphaned cattle as sold so they won't block future checks
        const orphanIds = existingItems.map((e)=>e.cattle_id);
        await admin.from("cattle").update({
            status: "sold"
        }).in("id", orphanIds);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "One or more animals were already recorded in a previous sale. Their status has been corrected — please refresh the page and try again."
        }, {
            status: 409
        });
    }
    // ── Step 3: Create sale record ─────────────────────────────────────────────
    const { data: sale, error: saleError } = await admin.from("sales").insert({
        farm_id: session.farm_id,
        station_id: stationId,
        sale_type: saleType,
        buyer_name: buyerName || null,
        buyer_phone: buyerPhone || null,
        slaughterhouse: slaughterhouse || null,
        meat_weight_kg: meatWeightKg ? Number(meatWeightKg) : null,
        price_per_kg: pricePerKg ? Number(pricePerKg) : null,
        total_price: Number(totalPrice),
        sale_date: saleDate,
        notes: notes || null,
        recorded_by: session.farm_user_id
    }).select("id").single();
    if (saleError || !sale) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: saleError?.message ?? "Failed to create sale"
        }, {
            status: 500
        });
    }
    // ── Step 4: Insert sale_items — rollback sale if this fails ───────────────
    const saleItems = animals.map((a)=>({
            sale_id: sale.id,
            cattle_id: a.cattleId,
            farm_id: session.farm_id,
            individual_price: Number(a.price)
        }));
    const { error: itemsError } = await admin.from("sale_items").insert(saleItems);
    if (itemsError) {
        await admin.from("sales").delete().eq("id", sale.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Failed to record sale items: ${itemsError.message}`
        }, {
            status: 500
        });
    }
    // ── Step 5: Update cattle status — rollback everything if this fails ────────
    const newStatus = saleType === "slaughter" ? "slaughtered" : "sold";
    const { error: statusError } = await admin.from("cattle").update({
        status: newStatus
    }).in("id", cattleIds).eq("farm_id", session.farm_id);
    if (statusError) {
        await admin.from("sale_items").delete().eq("sale_id", sale.id);
        await admin.from("sales").delete().eq("id", sale.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: `Failed to update cattle status: ${statusError.message}`
        }, {
            status: 500
        });
    }
    // ── Step 6: Post income to Finance (fire and forget — sale already committed) ─
    const saleCategory = saleType === "slaughter" ? "Slaughter Sale" : "Cattle Sale";
    const saleDesc = buyerName ? `${saleCategory} to ${buyerName} — ${cattleIds.length} animal(s)` : slaughterhouse ? `Slaughter at ${slaughterhouse} — ${cattleIds.length} animal(s)` : `${saleCategory} — ${cattleIds.length} animal(s)`;
    await admin.from("transactions").insert({
        farm_id: session.farm_id,
        station_id: stationId,
        type: "income",
        category: "cattle_sale",
        amount: Number(totalPrice),
        description: saleDesc,
        transaction_date: saleDate,
        recorded_by: session.farm_user_id
    });
    // Notify farm admins about the sale
    await admin.from("notifications").insert({
        farm_id: session.farm_id,
        user_id: null,
        type: "sale",
        severity: "info",
        title: "New Sale",
        message: `${cattleIds.length} animal(s) sold — PKR ${Number(totalPrice).toLocaleString()}`,
        link: "/erp/selling"
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        sale: {
            id: sale.id
        }
    }, {
        status: 201
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__66792530._.js.map