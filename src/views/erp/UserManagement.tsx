"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, AppRole } from "@/context/AuthContext";
import StatusBadge from "@/components/erp/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FarmUserRow {
  id: string;
  username: string;
  fullName: string;
  role: AppRole;
  stationId: string | null;
  stationName: string;
  isActive: boolean;
}

interface Station {
  id: string;
  station_tag: string;
  station_name: string;
  city: string;
}

const roleColors: Record<string, string> = {
  Admin: "bg-red-100 text-red-800",
  Manager: "bg-[#DBEAFE] text-[#1E40AF]",
  Veterinarian: "bg-[#D1FAE5] text-[#065F46]",
  "Accounts Officer": "bg-[#EDE9FE] text-[#6D28D9]",
  Worker: "bg-[#F3F4F6] text-[#374151]",
};

const roles: AppRole[] = ["Admin", "Manager", "Veterinarian", "Accounts Officer", "Worker"];

export default function UserManagement() {
  const { currentUser } = useAuth();
  const token = currentUser?.sessionToken ?? "";

  const [users, setUsers] = useState<FarmUserRow[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [stationFilter, setStationFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<FarmUserRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formFullName, setFormFullName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formRole, setFormRole] = useState<AppRole>("Worker");
  const [formStationId, setFormStationId] = useState<string>("none");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/farm-auth/users", { headers: authHeaders });
    const data = await res.json();
    if (res.ok) setUsers(data.users);
    else toast({ title: "Error", description: data.error, variant: "destructive" });
    setLoading(false);
  }, [token]);

  const fetchStations = useCallback(async () => {
    const res = await fetch("/api/farm-auth/stations", { headers: authHeaders });
    const data = await res.json();
    if (res.ok) setStations(data.stations);
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchStations();
  }, [fetchUsers, fetchStations]);

  const openAdd = () => {
    setFormFullName("");
    setFormUsername("");
    setFormRole("Worker");
    setFormStationId("none");
    setFormPassword("");
    setFormConfirmPassword("");
    setAddOpen(true);
  };

  const openEdit = (u: FarmUserRow) => {
    setFormFullName(u.fullName);
    setFormRole(u.role);
    setFormStationId(u.stationId ?? "none");
    setFormPassword("");
    setFormConfirmPassword("");
    setEditUser(u);
  };

  const closeDialog = () => {
    setAddOpen(false);
    setEditUser(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formPassword !== formConfirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await fetch("/api/farm-auth/users", {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formUsername,
        fullName: formFullName,
        role: formRole,
        stationId: formStationId === "none" ? null : formStationId,
        password: formPassword,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast({ title: "Failed to add user", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "User added", description: `${formFullName} added as ${formRole}` });
    closeDialog();
    fetchUsers();
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (formPassword && formPassword !== formConfirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSaving(true);
    const body: Record<string, unknown> = {
      fullName: formFullName,
      role: formRole,
      stationId: formStationId === "none" ? null : formStationId,
    };
    if (formPassword) body.password = formPassword;

    const res = await fetch(`/api/farm-auth/users/${editUser.id}`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      toast({ title: "Failed to update user", description: data.error, variant: "destructive" });
      return;
    }
    toast({ title: "User updated" });
    closeDialog();
    fetchUsers();
  };

  const toggleStatus = async (u: FarmUserRow) => {
    const res = await fetch(`/api/farm-auth/users/${u.id}`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, isActive: !u.isActive } : x))
      );
    } else {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground erp-slide-up">User Management</h1>
        <div className="flex items-center gap-3">
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue placeholder="Filter by station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem value="none">No Station</SelectItem>
              {stations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.station_tag} — {s.station_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card className="erp-glass-card-subtle erp-stagger-1">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading users...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter((u) => {
                  if (stationFilter === "all") return true;
                  if (stationFilter === "none") return u.stationId === null;
                  return u.stationId === stationFilter;
                }).map((u) => (
                  <TableRow key={u.id} className="erp-table-row">
                    <TableCell className="font-mono text-xs">{u.username}</TableCell>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${roleColors[u.role]} border-0`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.stationName}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleStatus(u)}
                        className="transition-transform hover:scale-105"
                      >
                        <StatusBadge status={u.isActive ? "Active" : "Inactive"} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.filter((u) => {
                  if (stationFilter === "all") return true;
                  if (stationFilter === "none") return u.stationId === null;
                  return u.stationId === stationFilter;
                }).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {stationFilter === "all" ? "No users yet. Add your first team member." : "No users found for this station."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={addOpen || !!editUser} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={editUser ? handleEdit : handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="e.g. Ahmed Raza"
                required
              />
            </div>

            {!editUser && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <Input
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="e.g. ahmed.raza"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Select value={formRole} onValueChange={(v) => setFormRole(v as AppRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Station</label>
              <Select value={formStationId} onValueChange={setFormStationId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Stations</SelectItem>
                  {stations.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.station_tag} — {s.station_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {editUser ? "New Password (leave blank to keep current)" : "Password"}
              </label>
              <Input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                required={!editUser}
                placeholder="••••••••"
              />
            </div>

            {(formPassword || !editUser) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input
                  type="password"
                  value={formConfirmPassword}
                  onChange={(e) => setFormConfirmPassword(e.target.value)}
                  required={!editUser || !!formPassword}
                  placeholder="••••••••"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="ghost" type="button" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editUser ? "Save Changes" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
