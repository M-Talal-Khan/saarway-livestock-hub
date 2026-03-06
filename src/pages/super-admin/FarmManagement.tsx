import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { pendingFarms, activeFarms as initialActive, suspendedFarms as initialSuspended } from "@/data/super-admin";

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Paid: "bg-[#D1FAE5] text-[#065F46]",
    Overdue: "bg-[#FEE2E2] text-[#991B1B]",
    Meat: "bg-[#FED7AA] text-[#C2410C]",
    Dairy: "bg-[#DBEAFE] text-[#1E40AF]",
    Both: "bg-[#EDE9FE] text-[#6D28D9]",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
};

const FarmManagement = () => {
  const { toast } = useToast();
  const [pending, setPending] = useState(pendingFarms);
  const [active, setActive] = useState(initialActive);
  const [suspended, setSuspended] = useState(initialSuspended);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [suspendModal, setSuspendModal] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleApprove = (farmName: string) => {
    setPending((p) => p.filter((f) => f.farmName !== farmName));
    toast({ title: "Farm Approved", description: `${farmName} has been approved and credentials sent.` });
  };

  const handleReject = () => {
    setPending((p) => p.filter((f) => f.farmName !== rejectModal));
    toast({ title: "Farm Rejected", description: `${rejectModal} registration rejected.` });
    setRejectModal(null);
    setReason("");
  };

  const handleSuspend = () => {
    const farm = active.find((f) => f.id === suspendModal);
    if (farm) {
      setActive((a) => a.filter((f) => f.id !== suspendModal));
      setSuspended((s) => [...s, { id: farm.id, name: farm.name, owner: farm.owner, reason, suspendedDate: new Date().toISOString().split("T")[0] }]);
      toast({ title: "Farm Suspended", description: `${farm.name} has been suspended.` });
    }
    setSuspendModal(null);
    setReason("");
  };

  const handleReactivate = (id: string) => {
    const farm = suspended.find((f) => f.id === id);
    if (farm) {
      setSuspended((s) => s.filter((f) => f.id !== id));
      setActive((a) => [...a, { id: farm.id, name: farm.name, owner: farm.owner, city: "—", animals: 0, listings: 0, feeStatus: "Paid" as const, joined: farm.suspendedDate }]);
      toast({ title: "Farm Reactivated", description: `${farm.name} has been reactivated.` });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Farm Management</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests ({pending.length})</TabsTrigger>
          <TabsTrigger value="active">Active Farms ({active.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspended.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Stations</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((f) => (
                    <TableRow key={f.farmName}>
                      <TableCell className="font-medium">{f.farmName}</TableCell>
                      <TableCell>{f.owner}</TableCell>
                      <TableCell>{f.phone}</TableCell>
                      <TableCell>{f.city}</TableCell>
                      <TableCell>{f.stations}</TableCell>
                      <TableCell>{statusBadge(f.type)}</TableCell>
                      <TableCell>{f.submitted}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 hover:scale-[1.02] text-xs" onClick={() => handleApprove(f.farmName)}>Approve</Button>
                          <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/5 text-xs" onClick={() => setRejectModal(f.farmName)}>Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pending.length === 0 && (
                    <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No pending requests</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm ID</TableHead>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Animals</TableHead>
                    <TableHead>Listings</TableHead>
                    <TableHead>Fee Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-sm">{f.id}</TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.owner}</TableCell>
                      <TableCell>{f.city}</TableCell>
                      <TableCell>{f.animals}</TableCell>
                      <TableCell>{f.listings}</TableCell>
                      <TableCell>{statusBadge(f.feeStatus)}</TableCell>
                      <TableCell>{f.joined}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive/5 text-xs" onClick={() => setSuspendModal(f.id)}>Suspend</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspended">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farm ID</TableHead>
                    <TableHead>Farm Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Suspension Reason</TableHead>
                    <TableHead>Suspended Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspended.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-sm">{f.id}</TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.owner}</TableCell>
                      <TableCell className="max-w-xs truncate">{f.reason}</TableCell>
                      <TableCell>{f.suspendedDate}</TableCell>
                      <TableCell>
                        <Button size="sm" className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 text-xs" onClick={() => handleReactivate(f.id)}>Reactivate</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {suspended.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No suspended farms</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => { setRejectModal(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject {rejectModal}?</DialogTitle></DialogHeader>
          <Textarea placeholder="Rejection reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Modal */}
      <Dialog open={!!suspendModal} onOpenChange={() => { setSuspendModal(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Suspend Farm?</DialogTitle></DialogHeader>
          <Textarea placeholder="Suspension reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspendModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={!reason}>Confirm Suspend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmManagement;
