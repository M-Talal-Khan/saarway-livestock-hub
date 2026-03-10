"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FarmRequest {
  id: string;
  farm_name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  approx_stations: number;
  description: string | null;
  status: string;
  duplicateStatus?: "active" | "suspended" | null;
  created_at?: string;
}

interface Farm {
  id: string;
  farm_number: number;
  farm_name: string;
  owner_name: string;
  city: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  suspension_reason: string | null;
  suspended_at: string | null;
  onboarded_at: string | null;
  passwordResetRequested?: boolean;
}

interface ApproveCredentials {
  farmNumber: number;
  username: string;
  password: string;
}

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

const FarmManagement = () => {
  const { toast } = useToast();

  const [requests, setRequests] = useState<FarmRequest[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingFarms, setLoadingFarms] = useState(true);

  const [rejectModal, setRejectModal] = useState<FarmRequest | null>(null);
  const [suspendModal, setSuspendModal] = useState<Farm | null>(null);
  const [detailsModal, setDetailsModal] = useState<Farm | null>(null);
  const [reason, setReason] = useState("");
  const [acting, setActing] = useState(false);

  const [credentials, setCredentials] = useState<ApproveCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/farm-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setRequests(data.requests);
    setLoadingRequests(false);
  }, []);

  const fetchFarms = useCallback(async () => {
    setLoadingFarms(true);
    const token = await getToken();
    const res = await fetch("/api/super-admin/farms", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setFarms(data.farms);
    setLoadingFarms(false);
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchFarms();
  }, [fetchRequests, fetchFarms]);

  const handleApprove = async (req: FarmRequest) => {
    setActing(true);
    const token = await getToken();
    const res = await fetch(`/api/super-admin/farm-requests/${req.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    const data = await res.json();
    setActing(false);
    if (!res.ok) {
      toast({ title: "Approval failed", description: data.error, variant: "destructive" });
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    fetchFarms();
    setCredentials({ farmNumber: data.farmNumber, username: data.username, password: data.password });
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActing(true);
    const token = await getToken();
    const res = await fetch(`/api/super-admin/farm-requests/${rejectModal.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    });
    setActing(false);
    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Failed to reject", description: data.error, variant: "destructive" });
      return;
    }
    setRequests((prev) => prev.filter((r) => r.id !== rejectModal.id));
    toast({ title: "Request rejected" });
    setRejectModal(null);
    setReason("");
  };

  const handleSuspend = async () => {
    if (!suspendModal || !reason) return;
    setActing(true);
    const token = await getToken();
    const res = await fetch(`/api/super-admin/farms/${suspendModal.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suspend", reason }),
    });
    setActing(false);
    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Failed to suspend", description: data.error, variant: "destructive" });
      return;
    }
    setFarms((prev) =>
      prev.map((f) =>
        f.id === suspendModal.id
          ? { ...f, is_active: false, suspension_reason: reason, suspended_at: new Date().toISOString() }
          : f
      )
    );
    toast({ title: `${suspendModal.farm_name} suspended` });
    setSuspendModal(null);
    setReason("");
  };

  const handleResetPassword = async (farm: Farm) => {
    const token = await getToken();
    const res = await fetch(`/api/super-admin/farms/${farm.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password" }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast({ title: "Failed to reset password", description: data.error, variant: "destructive" });
      return;
    }

    // Clear the password reset tag
    setFarms((prev) =>
      prev.map((f) =>
        f.id === farm.id ? { ...f, passwordResetRequested: false } : f
      )
    );

    setCredentials({ farmNumber: data.farmNumber, username: data.username, password: data.password });
  };

  const handleReactivate = async (farm: Farm) => {
    const token = await getToken();
    const res = await fetch(`/api/super-admin/farms/${farm.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reactivate" }),
    });
    if (!res.ok) {
      toast({ title: "Failed to reactivate", variant: "destructive" });
      return;
    }
    setFarms((prev) =>
      prev.map((f) =>
        f.id === farm.id ? { ...f, is_active: true, suspension_reason: null, suspended_at: null } : f
      )
    );
    toast({ title: `${farm.farm_name} reactivated` });
    // Refresh pending requests — any with this farm's email are now auto-rejected by the API
    fetchRequests();
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Farm ID: ${credentials.farmNumber}\nUsername: ${credentials.username}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pending = requests.filter((r) => r.status === "pending");
  const active = farms.filter((f) => f.is_active);
  const suspended = farms.filter((f) => !f.is_active);

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Farm Management</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspended.length})</TabsTrigger>
        </TabsList>

        {/* ── Pending ── */}
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              {loadingRequests ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Stations</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {r.farm_name}
                            {r.duplicateStatus === "active" && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                DUPLICATE
                              </span>
                            )}
                            {r.duplicateStatus === "suspended" && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                SUSPENDED
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{r.owner_name}</TableCell>
                        <TableCell>{r.phone}</TableCell>
                        <TableCell>{r.city}</TableCell>
                        <TableCell>{r.approx_stations}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 text-xs"
                              onClick={() => handleApprove(r)}
                              disabled={acting}
                            >
                              {acting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/5 text-xs"
                              onClick={() => { setRejectModal(r); setReason(""); }}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {pending.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No pending requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Active ── */}
        <TabsContent value="active">
          <Card>
            <CardContent className="p-0">
              {loadingFarms ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farm ID</TableHead>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Onboarded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {active.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-sm">{f.farm_number}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {f.farm_name}
                            {f.passwordResetRequested && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                🔑 RESET REQUESTED
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{f.owner_name}</TableCell>
                        <TableCell>{f.city}</TableCell>
                        <TableCell>{formatDate(f.onboarded_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-sw-sky-400 text-sw-sky-400 hover:bg-sw-sky-400/5"
                              onClick={() => setDetailsModal(f)}
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              variant={f.passwordResetRequested ? "default" : "outline"}
                              className="text-xs"
                              onClick={() => handleResetPassword(f)}
                            >
                              Reset Password
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive hover:bg-destructive/5 text-xs"
                              onClick={() => { setSuspendModal(f); setReason(""); }}
                            >
                              Suspend
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {active.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No active farms
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Suspended ── */}
        <TabsContent value="suspended">
          <Card>
            <CardContent className="p-0">
              {loadingFarms ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farm ID</TableHead>
                      <TableHead>Farm Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Suspension Reason</TableHead>
                      <TableHead>Suspended</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspended.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-mono text-sm">{f.farm_number}</TableCell>
                        <TableCell className="font-medium">{f.farm_name}</TableCell>
                        <TableCell>{f.owner_name}</TableCell>
                        <TableCell className="max-w-xs truncate">{f.suspension_reason ?? "—"}</TableCell>
                        <TableCell>{formatDate(f.suspended_at)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-sw-sky-400 text-sw-sky-400 hover:bg-sw-sky-400/5"
                              onClick={() => setDetailsModal(f)}
                            >
                              Details
                            </Button>
                            <Button
                              size="sm"
                              className="bg-sw-admin-green text-sw-admin-bg hover:bg-sw-admin-green/90 text-xs"
                              onClick={() => handleReactivate(f)}
                            >
                              Reactivate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {suspended.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No suspended farms
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Credentials Dialog (shown after approval) ── */}
      <Dialog open={!!credentials} onOpenChange={() => { setCredentials(null); setCopied(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Farm Approved — Share Credentials</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Send these login details to the farm owner. The password cannot be recovered later.
          </p>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
            <div><span className="text-muted-foreground">Farm ID:  </span><strong>{credentials?.farmNumber}</strong></div>
            <div><span className="text-muted-foreground">Username: </span><strong>{credentials?.username}</strong></div>
            <div><span className="text-muted-foreground">Password: </span><strong>{credentials?.password}</strong></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copyCredentials} className="gap-2">
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy All</>}
            </Button>
            <Button onClick={() => { setCredentials(null); setCopied(false); }}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={!!rejectModal} onOpenChange={() => { setRejectModal(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectModal?.farm_name}?</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={acting}>
              {acting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Suspend Dialog ── */}
      <Dialog open={!!suspendModal} onOpenChange={() => { setSuspendModal(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {suspendModal?.farm_name}?</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Suspension reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSuspendModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={acting || !reason}>
              {acting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Farm Details Dialog ── */}
      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Farm Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 pr-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Farm Name</span>
                <span className="font-medium text-foreground">{detailsModal?.farm_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Farm ID</span>
                <span className="font-mono text-foreground">{detailsModal?.farm_number}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Owner Name</span>
                <span className="font-medium text-foreground">{detailsModal?.owner_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">City</span>
                <span className="font-medium text-foreground">{detailsModal?.city}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div>
                <span className="text-muted-foreground block text-xs">Email Address</span>
                <a
                  href={`mailto:${detailsModal?.email}`}
                  className="font-medium text-sw-sky-400 hover:underline inline-flex items-center gap-2"
                >
                  {detailsModal?.email || "No email provided"}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Phone Number</span>
                <a
                  href={`tel:${detailsModal?.phone}`}
                  className="font-medium text-sw-sky-400 hover:underline inline-flex items-center gap-2"
                >
                  {detailsModal?.phone || "No phone provided"}
                </a>
              </div>
            </div>

            {!detailsModal?.is_active && detailsModal?.suspension_reason && (
              <div className="pt-4 border-t">
                <span className="text-muted-foreground block text-xs mb-1">Suspension Reason</span>
                <p className="text-sm bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20">
                  {detailsModal.suspension_reason}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmManagement;
