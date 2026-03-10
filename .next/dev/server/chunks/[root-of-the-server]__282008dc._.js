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
"[project]/app/api/erp/notifications/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/farm-session.ts [app-route] (ecmascript)");
;
;
;
function getCattleCode(raw) {
    const r = raw;
    return r?.cattle_code ?? "unknown";
}
function getStationName(raw) {
    const r = raw;
    return r?.station_name ?? "Unknown Station";
}
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
    const notifications = [];
    const now = new Date().toISOString();
    const today = new Date().toISOString().split("T")[0];
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const sevenDaysLaterStr = sevenDaysLater.toISOString().split("T")[0];
    // ── A. Persistent DB notifications ──────────────────────────────────────
    let dbQuery = admin.from("notifications").select("id, type, severity, title, message, link, is_read, created_at").eq("farm_id", farmId).eq("super_admin", false).order("created_at", {
        ascending: false
    }).limit(50);
    // Filter: user-specific notifications OR broadcast (user_id IS NULL)
    dbQuery = dbQuery.or(`user_id.eq.${session.farm_user_id},user_id.is.null`);
    const { data: dbNotifs } = await dbQuery;
    (dbNotifs ?? []).forEach((n)=>{
        notifications.push({
            id: n.id,
            type: n.type,
            severity: n.severity,
            title: n.title,
            message: n.message,
            link: n.link ?? "/",
            is_read: n.is_read,
            persistent: true,
            createdAt: n.created_at
        });
    });
    // ── B. Ephemeral notifications (existing logic) ─────────────────────────
    // 1. Overdue vaccinations → critical
    let vaxQuery = admin.from("vaccinations").select("id, vaccine_name, next_due_date, cattle(cattle_code)").eq("farm_id", farmId).not("next_due_date", "is", null).lt("next_due_date", today);
    if (sf.station_id) vaxQuery = vaxQuery.eq("station_id", sf.station_id);
    const { data: overdueVax } = await vaxQuery;
    (overdueVax ?? []).forEach((v)=>{
        notifications.push({
            id: `vax-overdue-${v.id}`,
            type: "vaccination",
            severity: "critical",
            title: "Overdue Vaccination",
            message: `${v.vaccine_name} overdue for ${getCattleCode(v.cattle)} (due ${new Date(v.next_due_date).toLocaleDateString("en-PK")})`,
            link: "/erp/health",
            is_read: false,
            persistent: false,
            createdAt: now
        });
    });
    // 2. Upcoming vaccinations (7 days) → warning
    let upcomingVaxQuery = admin.from("vaccinations").select("id, vaccine_name, next_due_date, cattle(cattle_code)").eq("farm_id", farmId).not("next_due_date", "is", null).gte("next_due_date", today).lte("next_due_date", sevenDaysLaterStr);
    if (sf.station_id) upcomingVaxQuery = upcomingVaxQuery.eq("station_id", sf.station_id);
    const { data: upcomingVax } = await upcomingVaxQuery;
    (upcomingVax ?? []).forEach((v)=>{
        notifications.push({
            id: `vax-upcoming-${v.id}`,
            type: "vaccination",
            severity: "warning",
            title: "Upcoming Vaccination",
            message: `${v.vaccine_name} due ≤7 days for ${getCattleCode(v.cattle)} (${new Date(v.next_due_date).toLocaleDateString("en-PK")})`,
            link: "/erp/health",
            is_read: false,
            persistent: false,
            createdAt: now
        });
    });
    // 3. Overdue rent → critical
    let rentQuery = admin.from("rent_details").select("id, owner_name, rent_amount, stations(station_name)").eq("farm_id", farmId).eq("payment_status", "overdue");
    if (sf.station_id) rentQuery = rentQuery.eq("station_id", sf.station_id);
    const { data: overdueRent } = await rentQuery;
    (overdueRent ?? []).forEach((r)=>{
        notifications.push({
            id: `rent-overdue-${r.id}`,
            type: "rent",
            severity: "critical",
            title: "Overdue Rent",
            message: `Rent overdue at ${getStationName(r.stations)} — PKR ${Number(r.rent_amount).toLocaleString()} owed to ${r.owner_name}`,
            link: "/erp/finance",
            is_read: false,
            persistent: false,
            createdAt: now
        });
    });
    // 4. Low feed stock → warning
    let feedQuery = admin.from("feed_items").select("id, name, current_stock, low_stock_threshold, unit, stations(station_name)").eq("farm_id", farmId).eq("is_active", true);
    if (sf.station_id) feedQuery = feedQuery.eq("station_id", sf.station_id);
    const { data: feedItems } = await feedQuery;
    (feedItems ?? []).filter((f)=>f.current_stock <= f.low_stock_threshold).forEach((f)=>{
        notifications.push({
            id: `feed-low-${f.id}`,
            type: "feed",
            severity: "warning",
            title: "Low Feed Stock",
            message: `Low stock: ${f.name} at ${getStationName(f.stations)} — ${f.current_stock} ${f.unit} remaining`,
            link: "/erp/feed",
            is_read: false,
            persistent: false,
            createdAt: now
        });
    });
    // 5. Active treatments → info
    let treatQuery = admin.from("treatments").select("id, condition_name, treatment_date, cattle(cattle_code)").eq("farm_id", farmId).is("outcome", null).order("treatment_date", {
        ascending: false
    }).limit(5);
    if (sf.station_id) treatQuery = treatQuery.eq("station_id", sf.station_id);
    const { data: treatments } = await treatQuery;
    (treatments ?? []).forEach((t)=>{
        notifications.push({
            id: `treat-active-${t.id}`,
            type: "treatment",
            severity: "info",
            title: "Active Treatment",
            message: `Ongoing treatment: ${t.condition_name} for ${getCattleCode(t.cattle)} (since ${new Date(t.treatment_date).toLocaleDateString("en-PK")})`,
            link: "/erp/health",
            is_read: false,
            persistent: false,
            createdAt: now
        });
    });
    // Sort: critical → warning → info, then by date
    const order = {
        critical: 0,
        warning: 1,
        info: 2
    };
    notifications.sort((a, b)=>order[a.severity] - order[b.severity] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        notifications
    });
}
async function PATCH(request) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyFarmSession"])(request);
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    const { id } = await request.json();
    if (!id) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "ID required"
    }, {
        status: 400
    });
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    await admin.from("notifications").update({
        is_read: true
    }).eq("id", id);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
}
async function DELETE(request) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$farm$2d$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyFarmSession"])(request);
    if (!session) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        error: "Unauthorized"
    }, {
        status: 401
    });
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const all = url.searchParams.get("all");
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    if (all === "true") {
        // Delete all persistent notifications for this user
        await admin.from("notifications").delete().eq("farm_id", session.farm_id).or(`user_id.eq.${session.farm_user_id},user_id.is.null`);
    } else if (id) {
        await admin.from("notifications").delete().eq("id", id);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__282008dc._.js.map