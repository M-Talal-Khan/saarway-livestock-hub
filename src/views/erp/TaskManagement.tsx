"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
    Plus, Loader2, ClipboardList, User, Calendar, ChevronDown, ChevronUp, Trash2, AlertCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import StatusBadge from "@/components/erp/StatusBadge";

interface TaskItem {
    id: string;
    text: string;
    is_done: boolean;
    done_at: string | null;
    sort_order: number;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    due_date: string | null;
    created_at: string;
    station_id: string | null;
    assignee: { id: string; full_name: string; role: string } | null;
    assigner: { id: string; full_name: string; role: string } | null;
    stations: { station_name: string } | null;
    task_items: TaskItem[];
}

interface FarmUser {
    id: string;
    fullName: string;
    role: string;
    stationName: string;
    stationId: string | null;
    isActive: boolean;
}

interface Station {
    id: string;
    station_name: string;
}

const priorityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    normal: "bg-blue-100 text-blue-700",
    high: "bg-amber-100 text-amber-700",
    urgent: "bg-destructive/15 text-destructive",
};

interface TaskCardProps {
    task: Task;
    isExpanded: boolean;
    onToggleExpand: () => void;
    canCreate: boolean;
    onDelete: () => void;
    onToggleItem: (itemId: string) => void;
}

const TaskCard = ({ task, isExpanded, onToggleExpand, canCreate, onDelete, onToggleItem }: TaskCardProps) => {
    const doneCount = task.task_items.filter((i) => i.is_done).length;
    const totalCount = task.task_items.length;
    const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

    return (
        <Card className={`erp-glass-card transition-all duration-200 ${isOverdue ? "border-destructive/40" : ""}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <button
                        className="flex-1 min-w-0 text-left"
                        onClick={onToggleExpand}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <Badge className={`text-[10px] px-1.5 py-0 h-4 ${priorityColors[task.priority]}`}>
                                {task.priority}
                            </Badge>
                            <StatusBadge status={task.status === "in_progress" ? "Ongoing" : task.status === "completed" ? "Completed" : "Pending"} />
                            {isOverdue && (
                                <span className="text-[10px] text-destructive flex items-center gap-0.5">
                                    <AlertCircle className="h-3 w-3" /> Overdue
                                </span>
                            )}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground leading-tight">{task.title}</h3>
                        {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {task.assignee?.full_name ?? "Unknown"} <span className="text-[10px] opacity-70">({task.assignee?.role ?? "No Role"})</span>
                            </span>
                            {task.due_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {new Date(task.due_date).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                                </span>
                            )}
                            {task.stations?.station_name && (
                                <span className="text-[10px]">{task.stations.station_name}</span>
                            )}
                        </div>
                        {totalCount > 0 && (
                            <div className="mt-2.5 flex items-center gap-2">
                                <Progress value={progress} className="h-1.5 flex-1" />
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{doneCount}/{totalCount}</span>
                            </div>
                        )}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                        {canCreate && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Expanded checklist */}
                {isExpanded && totalCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                        {task.task_items
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map((item) => (
                                <label key={item.id} className="flex items-center gap-2.5 cursor-pointer group">
                                    <Checkbox
                                        checked={item.is_done}
                                        onCheckedChange={() => onToggleItem(item.id)}
                                        className="shrink-0"
                                    />
                                    <span className={`text-sm transition-all ${item.is_done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                        {item.text}
                                    </span>
                                </label>
                            ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const TaskManagement = () => {
    const { currentUser, currentStation } = useAuth();
    const token = currentUser?.sessionToken ?? "";
    const role = currentUser?.role ?? "";
    const canCreate = ["Admin", "Manager"].includes(role);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [farmUsers, setFarmUsers] = useState<FarmUser[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        assignedTo: "",
        stationId: currentStation?.id ?? "",
        priority: "normal",
        dueDate: "",
    });
    const [checklistItems, setChecklistItems] = useState<string[]>([""]);

    const fetchData = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [tasksRes, usersRes, stationsRes] = await Promise.all([
                fetch("/api/erp/tasks", { headers }),
                fetch("/api/farm-auth/users", { headers }),
                fetch("/api/farm-auth/stations", { headers }),
            ]);
            const [td, ud, sd] = await Promise.all([tasksRes.json(), usersRes.json(), stationsRes.json()]);
            setTasks(td.tasks ?? []);
            setFarmUsers((ud.users ?? []).filter((u: FarmUser) => u.isActive));
            setStations(sd.stations ?? []);
        } catch {
            toast({ title: "Error", description: "Failed to load tasks", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchData();
    }, [token, fetchData]);

    // Filtered tasks
    const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== "completed"), [tasks]);
    const completedTasks = useMemo(() => tasks.filter((t) => t.status === "completed"), [tasks]);

    // Create task
    const handleCreate = async () => {
        if (!form.title || !form.assignedTo) {
            toast({ title: "Error", description: "Title and assignee are required", variant: "destructive" });
            return;
        }
        setSaving(true);
        try {
            const items = checklistItems.filter((t) => t.trim()).map((text) => ({ text: text.trim() }));
            const res = await fetch("/api/erp/tasks", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description || null,
                    assignedTo: form.assignedTo,
                    stationId: form.stationId || null,
                    priority: form.priority,
                    dueDate: form.dueDate || null,
                    items,
                }),
            });
            if (!res.ok) {
                const e = await res.json();
                throw new Error(e.error);
            }
            toast({ title: "Task created", description: "The worker has been notified." });
            setCreateOpen(false);
            setForm({ title: "", description: "", assignedTo: "", stationId: currentStation?.id ?? "", priority: "normal", dueDate: "" });
            setChecklistItems([""]);
            await fetchData();
        } catch (e: unknown) {
            toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    // Toggle checklist item
    const handleToggleItem = async (taskId: string, itemId: string) => {
        // Optimistic update
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id !== taskId) return t;
                return {
                    ...t,
                    task_items: t.task_items.map((i) =>
                        i.id === itemId ? { ...i, is_done: !i.is_done } : i
                    ),
                };
            })
        );

        try {
            const res = await fetch(`/api/erp/tasks/${taskId}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggle-item", itemId }),
            });
            if (!res.ok) throw new Error("Failed");
            // Refresh to get updated status
            await fetchData();
        } catch {
            toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
            await fetchData();
        }
    };

    // Delete task
    const handleDelete = async (taskId: string) => {
        try {
            await fetch(`/api/erp/tasks/${taskId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "Task deleted" });
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
        }
    };

    // Add checklist item input
    const addItemSlot = () => setChecklistItems((prev) => [...prev, ""]);
    const updateItem = (i: number, v: string) =>
        setChecklistItems((prev) => prev.map((item, idx) => (idx === i ? v : item)));
    const removeItem = (i: number) =>
        setChecklistItems((prev) => prev.filter((_, idx) => idx !== i));

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;


    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-foreground erp-slide-up">Tasks</h1>
                {canCreate && (
                    <Button
                        onClick={() => {
                            setForm({ title: "", description: "", assignedTo: "", stationId: currentStation?.id ?? "", priority: "normal", dueDate: "" });
                            setChecklistItems([""]);
                            setCreateOpen(true);
                        }}
                        className="gap-1.5 h-9"
                    >
                        <Plus className="h-4 w-4" /> Assign Task
                    </Button>
                )}
            </div>

            <Tabs defaultValue="active" className="erp-stagger-1">
                <TabsList>
                    <TabsTrigger value="active" className="text-xs">
                        Active {pendingTasks.length > 0 && <span className="ml-1 text-[10px] opacity-70">({pendingTasks.length})</span>}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs">
                        Completed {completedTasks.length > 0 && <span className="ml-1 text-[10px] opacity-70">({completedTasks.length})</span>}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-4">
                    {pendingTasks.length === 0 ? (
                        <Card className="erp-glass-card-subtle">
                            <CardContent className="py-16 text-center">
                                <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">No active tasks</p>
                                {canCreate && <p className="text-xs text-muted-foreground mt-1">Create a task to assign work to your team.</p>}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pendingTasks.map((t) => (
                                <TaskCard
                                    key={t.id}
                                    task={t}
                                    isExpanded={expandedTask === t.id}
                                    onToggleExpand={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                                    canCreate={canCreate}
                                    onDelete={() => handleDelete(t.id)}
                                    onToggleItem={(itemId) => handleToggleItem(t.id, itemId)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                    {completedTasks.length === 0 ? (
                        <Card className="erp-glass-card-subtle">
                            <CardContent className="py-12 text-center text-muted-foreground text-sm">No completed tasks yet.</CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {completedTasks.map((t) => (
                                <TaskCard
                                    key={t.id}
                                    task={t}
                                    isExpanded={expandedTask === t.id}
                                    onToggleExpand={() => setExpandedTask(expandedTask === t.id ? null : t.id)}
                                    canCreate={canCreate}
                                    onDelete={() => handleDelete(t.id)}
                                    onToggleItem={(itemId) => handleToggleItem(t.id, itemId)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Task Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Assign New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Title *</label>
                            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Clean water troughs" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional details..." rows={2} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Assign To *</label>
                                <Select value={form.assignedTo} onValueChange={(v) => setForm((p) => ({ ...p, assignedTo: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                                    <SelectContent>
                                        {farmUsers
                                            .filter(u => !form.stationId || u.stationId === form.stationId)
                                            .map((u) => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.fullName} <span className="text-muted-foreground text-[10px]">({u.role})</span>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Station</label>
                                <Select value={form.stationId} onValueChange={(v) => setForm((p) => ({ ...p, stationId: v }))}>
                                    <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                                    <SelectContent>
                                        {stations.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>{s.station_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Due Date</label>
                                <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
                            </div>
                        </div>

                        {/* Checklist builder */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Checklist Items</label>
                            {checklistItems.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={item}
                                        onChange={(e) => updateItem(i, e.target.value)}
                                        placeholder={`Item ${i + 1}`}
                                        className="text-sm"
                                    />
                                    {checklistItems.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeItem(i)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="text-xs gap-1" onClick={addItemSlot}>
                                <Plus className="h-3 w-3" /> Add Item
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={saving}>
                            {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}Assign Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskManagement;
