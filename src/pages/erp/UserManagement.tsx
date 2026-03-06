import { useState } from 'react';
import { erpUsers, ERPUser } from '@/data/erp/users';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const roleColors: Record<string, string> = {
  'Admin': 'bg-red-100 text-red-800',
  'Manager': 'bg-[#DBEAFE] text-[#1E40AF]',
  'Veterinarian': 'bg-[#D1FAE5] text-[#065F46]',
  'Accounts Officer': 'bg-[#EDE9FE] text-[#6D28D9]',
  'Worker': 'bg-[#F3F4F6] text-[#374151]',
};

const stationOpts = ['All Stations', 'Station 1 — Main', 'Station 2 — East Wing', 'Station 3 — Pattoki Road'];
const roles: ERPUser['role'][] = ['Admin', 'Manager', 'Veterinarian', 'Accounts Officer', 'Worker'];

const UserManagement = () => {
  const [users, setUsers] = useState(erpUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<ERPUser | null>(null);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newUser: ERPUser = {
      username: fd.get('username') as string,
      fullName: fd.get('fullName') as string,
      role: fd.get('role') as ERPUser['role'],
      station: fd.get('station') as string,
      status: 'Active',
    };
    setUsers(prev => [...prev, newUser]);
    setAddOpen(false);
    toast({ title: 'User Added', description: `${newUser.fullName} added as ${newUser.role}` });
  };

  const toggleStatus = (username: string) => {
    setUsers(prev => prev.map(u => u.username === username ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Username</TableHead><TableHead>Full Name</TableHead><TableHead>Role</TableHead><TableHead>Station</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.username}>
                  <TableCell className="font-mono text-xs">{u.username}</TableCell>
                  <TableCell className="font-medium">{u.fullName}</TableCell>
                  <TableCell><Badge variant="secondary" className={`${roleColors[u.role]} border-0`}>{u.role}</Badge></TableCell>
                  <TableCell className="text-sm">{u.station}</TableCell>
                  <TableCell>
                    <button onClick={() => toggleStatus(u.username)} className="transition-transform hover:scale-105">
                      <StatusBadge status={u.status} />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={() => setEditUser(u)}><Pencil className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addOpen || !!editUser} onOpenChange={() => { setAddOpen(false); setEditUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input name="fullName" placeholder="e.g. Ahmed Raza" required defaultValue={editUser?.fullName} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <Input name="username" placeholder="e.g. ahmed.raza" required defaultValue={editUser?.username} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Select name="role" required defaultValue={editUser?.role || 'Worker'}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Station</label>
              <Select name="station" required defaultValue={editUser?.station || stationOpts[0]}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{stationOpts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {!editUser && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <Input name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <Input name="confirmPassword" type="password" required />
                </div>
              </>
            )}
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => { setAddOpen(false); setEditUser(null); }}>Cancel</Button>
              <Button type="submit">{editUser ? 'Save Changes' : 'Add User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
