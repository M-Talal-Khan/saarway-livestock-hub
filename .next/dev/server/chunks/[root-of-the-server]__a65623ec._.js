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
"[project]/app/api/erp/purchases/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
    let query = admin.from("purchases").select(`id, supplier_name, supplier_place, purchase_date, animal_count, transport_cost, total_amount, is_finalised, notes, station_id, stations(station_name, station_tag)`).eq("farm_id", session.farm_id).order("created_at", {
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
        purchases: data ?? []
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
        "manager"
    ].includes(session.role)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Forbidden"
        }, {
            status: 403
        });
    }
    const body = await request.json();
    const { stationId, supplierName, supplierPlace, purchaseDate, transportCost, animals } = body;
    if (!stationId || !supplierName || !supplierPlace || !purchaseDate || !Array.isArray(animals) || animals.length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing required fields"
        }, {
            status: 400
        });
    }
    const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAdminClient"])();
    const animalTotal = animals.reduce((sum, a)=>sum + Number(a.price), 0);
    const transport = Number(transportCost) || 0;
    const totalAmount = animalTotal + transport;
    // Create purchase record
    const { data: purchase, error: purchaseError } = await admin.from("purchases").insert({
        farm_id: session.farm_id,
        station_id: stationId,
        supplier_name: supplierName,
        supplier_place: supplierPlace,
        purchase_date: purchaseDate,
        animal_count: animals.length,
        transport_cost: transport,
        total_amount: totalAmount,
        is_finalised: false,
        recorded_by: session.farm_user_id
    }).select("id").single();
    if (purchaseError || !purchase) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: purchaseError?.message ?? "Failed to create purchase"
        }, {
            status: 500
        });
    }
    // Insert each animal as cattle
    const cattleRows = animals.map((a)=>({
            farm_id: session.farm_id,
            station_id: stationId,
            purchase_id: purchase.id,
            breed: a.breed,
            teeth: Number(a.teeth),
            initial_weight: Number(a.weight),
            current_weight: Number(a.weight),
            gender: String(a.gender).toLowerCase(),
            purchase_price: Number(a.price),
            purchase_date: purchaseDate,
            status: "active",
            created_by: session.farm_user_id
        }));
    // Manually generate cattle_code in the format `F00X-YYYY` 
    // Fetch all existing cattle codes for this farm to find the absolute numeric maximum
    const { data: existingCattle, error: cattleErr } = await admin.from("cattle").select("cattle_code").eq("farm_id", session.farm_id).neq("cattle_code", "").not("cattle_code", "is", null);
    if (cattleErr) {
        await admin.from("purchases").delete().eq("id", purchase.id);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to read existing cattle codes"
        }, {
            status: 500
        });
    }
    let farmPrefix = "F001"; // Default
    let maxCattleNum = 0;
    if (existingCattle && existingCattle.length > 0) {
        existingCattle.forEach((c)=>{
            if (c.cattle_code) {
                const parts = c.cattle_code.split("-");
                if (parts.length === 2) {
                    farmPrefix = parts[0]; // Assume first string is prefix
                    const parsedNum = parseInt(parts[1], 10);
                    if (!isNaN(parsedNum) && parsedNum > maxCattleNum) {
                        maxCattleNum = parsedNum;
                    }
                }
            }
        });
    }
    let nextCattleNum = maxCattleNum + 1;
    const cattleData = [];
    for (const row of cattleRows){
        const generatedCode = `${farmPrefix}-${String(nextCattleNum).padStart(4, "0")}`;
        const { data: c, error: cErr } = await admin.from("cattle").insert({
            ...row,
            cattle_code: generatedCode
        }).select("id").single();
        if (cErr) {
            // Rollback purchase
            await admin.from("purchases").delete().eq("id", purchase.id);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: cErr.message
            }, {
                status: 500
            });
        }
        if (c) cattleData.push(c);
        nextCattleNum++; // Increment for the next animal in the batch
    }
    // Link cattle to purchase via purchase_animals
    const linkRows = (cattleData ?? []).map((c)=>({
            purchase_id: purchase.id,
            cattle_id: c.id,
            farm_id: session.farm_id
        }));
    await admin.from("purchase_animals").insert(linkRows);
    // Finalize purchase
    await admin.from("purchases").update({
        is_finalised: true,
        total_amount: totalAmount
    }).eq("id", purchase.id);
    // Post expense to Finance
    await admin.from("transactions").insert({
        farm_id: session.farm_id,
        station_id: stationId,
        type: "expense",
        category: "cattle_purchase",
        amount: totalAmount,
        description: `Purchase from ${supplierName} (${supplierPlace}) — ${animals.length} animal(s)`,
        transaction_date: purchaseDate,
        recorded_by: session.farm_user_id
    });
    // Notify farm admins about the purchase
    await admin.from("notifications").insert({
        farm_id: session.farm_id,
        user_id: null,
        type: "purchase",
        severity: "info",
        title: "New Purchase",
        message: `${animals.length} animal(s) purchased from ${supplierName} (${supplierPlace}) — PKR ${totalAmount.toLocaleString()}`,
        link: "/erp/buying"
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        purchase: {
            id: purchase.id,
            totalAmount
        }
    }, {
        status: 201
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a65623ec._.js.map