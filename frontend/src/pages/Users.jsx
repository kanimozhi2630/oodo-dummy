import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Pencil, ToggleLeft, ToggleRight, KeyRound, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { getRoleName, getRoleBadgeClass, formatDate } from '../utils/helpers';

const ROLES = ['esg_manager', 'hr_manager', 'compliance_officer', 'employee'];

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-lg">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', department: '', phone: '' });
  const [resetPwd, setResetPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([api.get('/users'), api.get('/departments')])
      .then(([u, d]) => { setUsers(u.data.users); setDepartments(d.data.departments); })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Name, email, and password are required.');
    setSaving(true);
    try {
      const { data } = await api.post('/users', form);
      setUsers((prev) => [data.user, ...prev]);
      toast.success(`${form.name} added successfully.`);
      setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create user.'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (user) => {
    try {
      const { data } = await api.put(`/users/${user._id}/toggle-status`);
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: data.isActive } : u));
      toast.success(`User ${data.isActive ? 'enabled' : 'disabled'}.`);
    } catch { toast.error('Failed to toggle status.'); }
  };

  const handleResetPwd = async () => {
    if (!resetPwd || resetPwd.length < 8) return toast.error('Password must be at least 8 characters.');
    setSaving(true);
    try {
      await api.put(`/users/${selected._id}/reset-password`, { newPassword: resetPwd });
      toast.success('Password reset successfully.');
      setModal(null);
    } catch { toast.error('Failed to reset password.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Create and manage organization users</p>
        </div>
        <button onClick={() => { setForm({ name: '', email: '', password: '', role: 'employee', department: '', phone: '' }); setModal('create'); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-9" />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input w-48">
          <option value="">All Roles</option>
          {['ceo', ...ROLES].map((r) => <option key={r} value={r}>{getRoleName(r)}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Filter className="w-4 h-4" /> {filtered.length} users
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>User</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i}>{[...Array(6)].map((_,j) => <td key={j}><div className="skeleton h-4 rounded w-24" /></td>)}</tr>
                ))
              ) : filtered.length > 0 ? filtered.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${getRoleBadgeClass(user.role)}`}>{getRoleName(user.role)}</span></td>
                  <td className="text-gray-500">{user.department?.name || '—'}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-green' : 'badge-red'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="text-gray-400 text-xs">{formatDate(user.lastLogin) || 'Never'}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {user.role !== 'ceo' && (
                        <>
                          <button onClick={() => handleToggle(user)} className="btn-ghost p-1.5 rounded-lg" title={user.isActive ? 'Disable' : 'Enable'}>
                            {user.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                          </button>
                          <button onClick={() => { setSelected(user); setResetPwd(''); setModal('reset'); }} className="btn-ghost p-1.5 rounded-lg" title="Reset Password">
                            <KeyRound className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No users found</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {modal === 'create' && (
        <Modal title="Add New User" onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Full Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" placeholder="John Doe" /></div>
              <div><label className="label">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="input" placeholder="john@company.com" /></div>
              <div><label className="label">Password *</label><input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input" placeholder="Min. 8 chars" /></div>
              <div><label className="label">Phone</label><input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" placeholder="+1 234 567 8900" /></div>
              <div>
                <label className="label">Role *</label>
                <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="input">
                  {ROLES.map((r) => <option key={r} value={r}>{getRoleName(r)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="input">
                  <option value="">-- None --</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset password modal */}
      {modal === 'reset' && (
        <Modal title={`Reset Password — ${selected?.name}`} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">New Password *</label>
              <input type="password" value={resetPwd} onChange={(e) => setResetPwd(e.target.value)} className="input" placeholder="Min. 8 characters" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleResetPwd} disabled={saving} className="btn-danger flex-1">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
