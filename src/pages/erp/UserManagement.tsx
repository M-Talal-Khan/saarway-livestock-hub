import { useState } from 'react';
import { erpUsers, ERPUser } from '@/data/erp/users';
import StatusBadge from '@/components/erp/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const roleColors: Record<string, string> = {
  'Admin': 'bg-red-100 text-red-800',
  'Manager': 'bg-blue-100 text-blue-800',
  'Veterinarian': 'bg-green-100 text-green-800',
  'Accounts Officer': 'bg-purple-100 text-purple-800',
  'Worker': 'bg-gray-100 text-gray-800',
};

const stations = ['All Stations', 'Station 1 — Main', 'Station 2 — East Wing', 'Station 3 — Pattoki Road'];
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-1"><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader><TableRow className="bg-muted/50">
            <TableHead>Username</TableHead><TableHead>Full Name</TableHead><TableHead>Role</TableHead><TableHead>Station</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.username}>
                <TableCell className="font-mono text-xs">{u.username}</TableCell>
                <TableCell>{u.fullName}</TableCell>
                <TableCell><Badge variant="secondary" className={roleColors[u.role]}>{u.role}</Badge></TableCell>
                <TableCell className="text-xs">{u.station}</TableCell>
                <TableCell>
                  <button onClick={() => toggleStatus(u.username)}>
                    <StatusBadge status={u.status} />
                  </button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditUser(u)}><Pencil className="h-3 w-3" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={addOpen || !!editUser} onOpenChange={() => { setAddOpen(false); setEditUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input name="fullName" placeholder="Full Name" required defaultValue={editUser?.fullName} />
            <Input name="username" placeholder="Username" required defaultValue={editUser?.username} />
            <select name="role" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={editUser?.role}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select name="station" required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={editUser?.station}>
              {stations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {!editUser && (
              <>
                <Input name="password" type="password" placeholder="Password" required />
                <Input name="confirmPassword" type="password" placeholder="Confirm Password" required />
              </>
            )}
            <Button type="submit" className="w-full">{editUser ? 'Save Changes' : 'Add User'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
