"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { adminMessages, type AdminMessage } from "@/data/super-admin";

type MsgStatus = AdminMessage["status"];

const statusBadge = (status: MsgStatus) => {
  const map: Record<MsgStatus, string> = {
    Unread: "bg-[#DBEAFE] text-[#1E40AF]",
    Read: "bg-[#F3F4F6] text-[#374151]",
    Resolved: "bg-[#D1FAE5] text-[#065F46]",
  };
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>{status}</span>;
};

const typeBadge = (type: string) => {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${type === "Farm Owner" ? "bg-[#EDE9FE] text-[#6D28D9]" : "bg-[#DBEAFE] text-[#1E40AF]"}`}>
      {type}
    </span>
  );
};

const Messages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState(adminMessages);
  const [viewMsg, setViewMsg] = useState<(typeof adminMessages)[0] | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = messages.filter((m) => {
    if (typeFilter !== "all" && m.type !== typeFilter) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    return true;
  });

  const markResolved = (id: number) => {
    setMessages((msgs) => msgs.map((m) => m.id === id ? { ...m, status: "Resolved" as const } : m));
    toast({ title: "Message marked as resolved" });
    setViewMsg(null);
  };

  const openMessage = (msg: (typeof adminMessages)[0]) => {
    setMessages((msgs) => msgs.map((m) => m.id === msg.id && m.status === "Unread" ? { ...m, status: "Read" as const } : m));
    setViewMsg(msg);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Messages</h1>

      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Farm Owner">Farm Owner</SelectItem>
            <SelectItem value="General User">General User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Unread">Unread</SelectItem>
            <SelectItem value="Read">Read</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id} className={m.status === "Unread" ? "font-medium" : m.status === "Resolved" ? "opacity-60" : ""}>
                  <TableCell>{typeBadge(m.type)}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell className="text-sm">{m.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm">{m.message}</TableCell>
                  <TableCell>{m.date}</TableCell>
                  <TableCell>{statusBadge(m.status as MsgStatus)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => openMessage(m)}>View</Button>
                      {m.status !== "Resolved" && (
                        <Button size="sm" variant="ghost" className="text-xs text-sw-admin-green" onClick={() => markResolved(m.id)}>Resolve</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      <Dialog open={!!viewMsg} onOpenChange={() => setViewMsg(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Message from {viewMsg?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4">
              <span className="text-muted-foreground">Type:</span> {viewMsg && typeBadge(viewMsg.type)}
            </div>
            <div className="flex gap-4">
              <span className="text-muted-foreground">Email:</span> <span>{viewMsg?.email}</span>
            </div>
            {viewMsg?.phone && (
              <div className="flex gap-4">
                <span className="text-muted-foreground">Phone:</span> <span>{viewMsg.phone}</span>
              </div>
            )}
            <div className="flex gap-4">
              <span className="text-muted-foreground">Date:</span> <span>{viewMsg?.date}</span>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-foreground leading-relaxed">{viewMsg?.message}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" asChild className="gap-1.5">
              <a href={`mailto:${viewMsg?.email}`}><Mail className="h-4 w-4" /> Reply via Email</a>
            </Button>
            {viewMsg && viewMsg.status !== "Resolved" && (
              <Button className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90" onClick={() => markResolved(viewMsg.id)}>Mark Resolved</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
