import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFarmSession } from "@/lib/supabase/farm-session";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await verifyFarmSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const admin = createAdminClient();

    // Toggle a checklist item
    if (body.action === "toggle-item" && body.itemId) {
        const { data: item } = await admin
            .from("task_items")
            .select("is_done, task_id")
            .eq("id", body.itemId)
            .single();

        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        const newDone = !item.is_done;
        await admin
            .from("task_items")
            .update({ is_done: newDone, done_at: newDone ? new Date().toISOString() : null })
            .eq("id", body.itemId);

        // Check if all items are done → auto-complete the task
        const { data: allItems } = await admin
            .from("task_items")
            .select("is_done")
            .eq("task_id", id);

        const allDone = allItems && allItems.length > 0 && allItems.every((i) => i.is_done);

        if (allDone) {
            await admin
                .from("tasks")
                .update({ status: "completed", updated_at: new Date().toISOString() })
                .eq("id", id);

            // Notify the assigner
            const { data: task } = await admin
                .from("tasks")
                .select("title, assigned_by, farm_id, assigned_to")
                .eq("id", id)
                .single();

            if (task) {
                const { data: worker } = await admin
                    .from("farm_users")
                    .select("full_name")
                    .eq("id", task.assigned_to)
                    .single();

                await admin.from("notifications").insert({
                    farm_id: task.farm_id,
                    user_id: task.assigned_by,
                    type: "task_completed",
                    severity: "info",
                    title: "Task Completed",
                    message: `${worker?.full_name ?? "Worker"} completed: "${task.title}"`,
                    link: "/erp/tasks",
                });
            }
        } else if (!allDone) {
            // If unchecking an item on a completed task, revert to in_progress
            const { data: taskRow } = await admin.from("tasks").select("status").eq("id", id).single();
            if (taskRow?.status === "completed") {
                await admin
                    .from("tasks")
                    .update({ status: "in_progress", updated_at: new Date().toISOString() })
                    .eq("id", id);
            }
        }

        return NextResponse.json({ ok: true });
    }

    // Update task status manually
    if (body.status) {
        const validStatuses = ["pending", "in_progress", "completed"];
        if (!validStatuses.includes(body.status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        await admin
            .from("tasks")
            .update({ status: body.status, updated_at: new Date().toISOString() })
            .eq("id", id);

        return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "No action specified" }, { status: 400 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await verifyFarmSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "manager"].includes(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("tasks").delete().eq("id", id).eq("farm_id", session.farm_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
