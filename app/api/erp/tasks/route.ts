import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession, stationFilter } from "@/lib/supabase/farm-session";

export async function GET(request: NextRequest) {
    const session = await verifyFarmSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const sf = stationFilter(session);

    let query = admin
        .from("tasks")
        .select(`id, title, description, priority, status, due_date, created_at, updated_at, station_id,
      assigned_to, assigned_by,
      assignee:farm_users!assigned_to(id, full_name, role),
      assigner:farm_users!assigned_by(id, full_name, role),
      stations(station_name),
      task_items(id, text, is_done, done_at, sort_order)`)
        .eq("farm_id", session.farm_id)
        .order("created_at", { ascending: false });

    // Only non-admins/non-managers are restricted to their own tasks
    if (!["admin", "manager"].includes(session.role)) {
        query = query.eq("assigned_to", session.farm_user_id);
    }

    if (sf.station_id) query = query.eq("station_id", sf.station_id);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ tasks: data ?? [] });
}

export async function POST(request: NextRequest) {
    const session = await verifyFarmSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "manager"].includes(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, assignedTo, stationId, priority, dueDate, items } = body;

    if (!title || !assignedTo) {
        return NextResponse.json({ error: "Title and assignee are required" }, { status: 400 });
    }

    const admin = createAdminClient();

    // Create task
    const { data: task, error: taskError } = await admin
        .from("tasks")
        .insert({
            farm_id: session.farm_id,
            station_id: stationId || null,
            title,
            description: description || null,
            assigned_to: assignedTo,
            assigned_by: session.farm_user_id,
            priority: priority || "normal",
            due_date: dueDate || null,
        })
        .select("id")
        .single();

    if (taskError || !task) {
        return NextResponse.json({ error: taskError?.message ?? "Failed to create task" }, { status: 500 });
    }

    // Insert checklist items
    if (Array.isArray(items) && items.length > 0) {
        const itemRows = items.map((item: { text: string }, i: number) => ({
            task_id: task.id,
            text: item.text,
            sort_order: i,
        }));
        await admin.from("task_items").insert(itemRows);
    }

    // Create notification for the assigned worker
    const { data: assigner } = await admin
        .from("farm_users")
        .select("full_name")
        .eq("id", session.farm_user_id)
        .single();

    await admin.from("notifications").insert({
        farm_id: session.farm_id,
        user_id: assignedTo,
        type: "task_assigned",
        severity: priority === "urgent" ? "critical" : priority === "high" ? "warning" : "info",
        title: "New Task Assigned",
        message: `${assigner?.full_name ?? "Manager"} assigned you: "${title}"`,
        link: "/erp/tasks",
    });

    return NextResponse.json({ task: { id: task.id } }, { status: 201 });
}
