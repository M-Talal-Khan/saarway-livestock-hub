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
"[project]/app/api/erp/dashboard/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
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
    const farmId = session.farm_id;
    // ── Cattle counts ────────────────────────────────────────────────────────────
    let cattleQuery = admin.from("cattle").select("id, status, station_id").eq("farm_id", farmId);
    if (sf.station_id) cattleQuery = cattleQuery.eq("station_id", sf.station_id);
    const { data: allCattle } = await cattleQuery;
    const cattle = allCattle ?? [];
    const activeCattle = cattle.filter((c)=>![
            "sold",
            "slaughtered",
            "dead"
        ].includes(c.status)).length;
    const readyForSale = cattle.filter((c)=>c.status === "ready_for_sale").length;
    const listedCattle = cattle.filter((c)=>c.status === "listed").length;
    // ── Vaccinations ────────────────────────────────────────────────────────────
    let vacQuery = admin.from("vaccinations").select("id, status, next_due_date, vaccine_name, cattle_id, cattle(cattle_code)").eq("farm_id", farmId).in("status", [
        "overdue",
        "upcoming"
    ]);
    if (sf.station_id) vacQuery = vacQuery.eq("station_id", sf.station_id);
    const { data: pendingVaccinations } = await vacQuery;
    const overdueVaccinations = (pendingVaccinations ?? []).filter((v)=>v.status === "overdue").length;
    const upcomingVaccinations = (pendingVaccinations ?? []).filter((v)=>v.status === "upcoming").length;
    // ── Treatments ───────────────────────────────────────────────────────────────
    let treatQuery = admin.from("treatments").select("id, condition_name, treatment_date, outcome, cattle_id, cattle(cattle_code, breed)").eq("farm_id", farmId).is("outcome", null).order("treatment_date", {
        ascending: false
    });
    if (sf.station_id) treatQuery = treatQuery.eq("station_id", sf.station_id);
    const { data: activeTreatments } = await treatQuery;
    // ── Finance (6 months) ───────────────────────────────────────────────────────
    const since = new Date();
    since.setMonth(since.getMonth() - 6);
    const sinceStr = since.toISOString().split("T")[0];
    let txnQuery = admin.from("transactions").select("type, category, amount, transaction_date").eq("farm_id", farmId).gte("transaction_date", sinceStr);
    if (sf.station_id) txnQuery = txnQuery.eq("station_id", sf.station_id);
    const { data: transactions } = await txnQuery;
    const income = (transactions ?? []).filter((t)=>t.type === "income").reduce((s, t)=>s + t.amount, 0);
    const expenses = (transactions ?? []).filter((t)=>t.type === "expense").reduce((s, t)=>s + t.amount, 0);
    // ── Feed alerts ──────────────────────────────────────────────────────────────
    let feedQuery = admin.from("feed_items").select("id, name, current_stock, low_stock_threshold, unit, station_id, stations(station_name)").eq("farm_id", farmId).eq("is_active", true);
    if (sf.station_id) feedQuery = feedQuery.eq("station_id", sf.station_id);
    const { data: feedItems } = await feedQuery;
    const lowFeedAlerts = (feedItems ?? []).filter((f)=>f.current_stock <= f.low_stock_threshold);
    // ── Rent ─────────────────────────────────────────────────────────────────────
    let rentQuery = admin.from("rent_details").select("id, owner_name, rent_amount, payment_status, payment_due_day, station_id, stations(station_name)").eq("farm_id", farmId);
    if (sf.station_id) rentQuery = rentQuery.eq("station_id", sf.station_id);
    const { data: rentDetails } = await rentQuery;
    // ── Recent sales ─────────────────────────────────────────────────────────────
    let salesQuery = admin.from("sales").select("id, sale_type, total_price, sale_date, buyer_name").eq("farm_id", farmId).order("sale_date", {
        ascending: false
    }).limit(5);
    if (sf.station_id) salesQuery = salesQuery.eq("station_id", sf.station_id);
    const { data: recentSales } = await salesQuery;
    // ── Worker tasks (for worker role) ───────────────────────────────────────────
    let workerCattle = [];
    if (session.role === "worker" && sf.station_id) {
        const { data } = await admin.from("cattle").select("id, cattle_code, breed, status, current_weight").eq("farm_id", farmId).eq("station_id", sf.station_id).in("status", [
            "active",
            "fattening"
        ]).order("cattle_code");
        workerCattle = data ?? [];
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        cattle: {
            total: activeCattle,
            readyForSale,
            listed: listedCattle
        },
        health: {
            overdueVaccinations,
            upcomingVaccinations,
            activeTreatments: (activeTreatments ?? []).length,
            recentTreatments: (activeTreatments ?? []).slice(0, 5),
            upcomingVaccinationsList: (pendingVaccinations ?? []).filter((v)=>v.status === "upcoming").slice(0, 5)
        },
        finance: {
            income,
            expenses,
            pl: income - expenses
        },
        alerts: {
            lowFeed: lowFeedAlerts.slice(0, 5),
            overdueRent: (rentDetails ?? []).filter((r)=>r.payment_status === "overdue")
        },
        rent: rentDetails ?? [],
        recentSales: recentSales ?? [],
        workerCattle
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__92445655._.js.map