import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { Plus, ShieldAlert, KeyRound, Ban, CheckCircle } from 'lucide-react';
import api from '../../lib/axios';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  active: boolean;
  locked: boolean;
  failedAttemptCount: number;
  lastLoginAt: string;
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', fullName: '', password: '', role: 'STAFF' });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data as User[];
    }
  });

  const createUser = useMutation({
    mutationFn: async (userData: any) => await api.post('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateOpen(false);
      toast.success('User created successfully. They must reset password on first login.');
      setNewUser({ username: '', fullName: '', password: '', role: 'STAFF' });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create user')
  });

  const userAction = useMutation({
    mutationFn: async ({ id, type }: { id: string, type: string }) => await api.post(`/users/${id}/action?type=${type}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User action applied');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed')
  });

  const resetPassword = useMutation({
    mutationFn: async (id: string) => await api.post(`/users/${id}/reset-password`, { newPassword: 'TempPassword123!' }),
    onSuccess: () => toast.success('Password reset to: TempPassword123!'),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Reset failed')
  });

  const handleCreateSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return toast.error('Required fields missing');
    createUser.mutate(newUser);
  };

  const columns = [
    { header: 'Username', accessor: (usr: User) => usr.username },
    { header: 'Full Name', accessor: (usr: User) => usr.fullName },
    { 
      header: 'Role', 
      accessor: (usr: User) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          usr.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
          usr.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>{usr.role}</span>
      )
    },
    { 
      header: 'Status', 
      accessor: (usr: User) => (
        <div className="flex gap-2">
           {!usr.active && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Deactivated</span>}
           {usr.locked && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Locked ({usr.failedAttemptCount} fails)</span>}
           {usr.active && !usr.locked && <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Active</span>}
        </div>
      )
    },
    {
      header: 'Last Login',
      accessor: (usr: User) => usr.lastLoginAt ? new Date(usr.lastLoginAt).toLocaleString() : 'Never'
    },
    {
      header: 'Actions',
      accessor: (usr: User) => (
        <div className="flex items-center gap-3">
          <button onClick={() => resetPassword.mutate(usr.id)} className="text-blue-600 hover:text-blue-800" title="Reset Password">
            <KeyRound size={18} />
          </button>
          
          {usr.locked ? (
            <button onClick={() => userAction.mutate({ id: usr.id, type: 'UNLOCK' })} className="text-green-600 hover:text-green-800" title="Unlock Account">
              <CheckCircle size={18} />
            </button>
          ) : (
            <button onClick={() => userAction.mutate({ id: usr.id, type: 'LOCK' })} className="text-orange-600 hover:text-orange-800" title="Lock Account">
              <ShieldAlert size={18} />
            </button>
          )}

          {usr.active ? (
            <button onClick={() => userAction.mutate({ id: usr.id, type: 'DEACTIVATE' })} className="text-red-600 hover:text-red-800" title="Deactivate">
              <Ban size={18} />
            </button>
          ) : (
            <button onClick={() => userAction.mutate({ id: usr.id, type: 'ACTIVATE' })} className="text-green-600 hover:text-green-800" title="Activate">
              <CheckCircle size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage hierarchical access control and security states.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus size={18} /> Add User
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Table data={users || []} columns={columns} keyExtractor={(u) => u.id} isLoading={isLoading} />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Secure User">
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
          <Input label="Username" value={newUser.username} onChange={e => setNewUser(x => ({...x, username: e.target.value}))} required />
          <Input label="Full Name" value={newUser.fullName} onChange={e => setNewUser(x => ({...x, fullName: e.target.value}))} required />
          <Input label="Temporary Password" type="password" value={newUser.password} onChange={e => setNewUser(x => ({...x, password: e.target.value}))} required />
          
          <div className="space-y-1 pb-2">
            <label className="block text-sm font-medium text-gray-700">Privilege Role</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={newUser.role} onChange={e => setNewUser(x => ({...x, role: e.target.value}))}>
              <option value="STAFF">STAFF (Cashier / Counter)</option>
              <option value="ADMIN">ADMIN (Branch Manager)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createUser.isPending}>
               {createUser.isPending ? 'Propagating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
