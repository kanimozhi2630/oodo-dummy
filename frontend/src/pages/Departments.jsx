import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, Users } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

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

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#F97316'];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', head: '', carbonBudget: '', color: '#3B82F6' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { hasRole } = useAuth();

  const canEdit = hasRole('ceo', 'hr_manager');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, userRes] = await Promise.all([api.get('/departments'), api.get('/users')]);
      setDepartments(deptRes.data.departments);
      setUsers(userRes.data.users);
    } catch { toast.error('Failed to load departments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setForm({ name: '', description: '', head: '', carbonBudget: '', color: '#3B82F6' }); setModal('create'); };
  const openEdit = (d) => { setSelected(d); setForm({ name: d.name, description: d.description, head: d.head?._id || '', carbonBudget: d.carbonBudget, color: d.color }); setModal('edit'); };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Department name is required.');
    setSaving(true);
    try {
      if (modal === 'create') {
        const { data } = await api.post('/departments', form);
        setDepartments((prev) => [data.department, ...prev]);
        toast.success('Department created successfully.');
      } else {
        const { data } = await api.put(`/departments/${selected._id}`, form);
        setDepartments((prev) => prev.map((d) => d._id === selected._id ? data.department : d));
        toast.success('Department updated.');
      }
      setModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      await api.delete(`/departments/${id}`);
      setDepartments((prev) => prev.filter((d) => d._id !== id));
      toast.success('Department deleted.');
    } catch { toast.error('Failed to delete department.'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Departments</h1>
          <p className="page-subtitle">Manage your organizational departments</p>
        </div>
        {canEdit && <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add Department</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i) => <div key={i} className="skeleton h-44 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const deptUsers = users.filter((u) => u.department?._id === dept._id);
            return (
              <div key={dept._id} className="card-hover p-5 animate-slide-up">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: dept.color + '20' }}>
                      <Building2 className="w-6 h-6" style={{ color: dept.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                      <p className="text-xs text-gray-400">{dept.head?.name || 'No head assigned'}</p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(dept)} className="btn-ghost p-1.5 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(dept._id)} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {dept.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{dept.description}</p>}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{deptUsers.length} members</div>
                  <div>ESG Score: <span className="font-bold text-primary-600">{dept.esgScore}</span></div>
                </div>
                <div className="mt-3 progress-bar">
                  <div className="progress-fill" style={{ width: `${dept.esgScore}%`, backgroundColor: dept.color }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>Carbon Budget</span>
                  <span className="font-medium">{dept.carbonBudget || 0} tCO₂e</span>
                </div>
              </div>
            );
          })}
          {departments.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No departments yet</p>
              {canEdit && <button onClick={openCreate} className="btn-primary mt-4"><Plus className="w-4 h-4" /> Create First Department</button>}
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Add Department' : 'Edit Department'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" placeholder="Engineering" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input resize-none" rows={3} placeholder="Department description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department Head</label>
                <select value={form.head} onChange={(e) => setForm({...form, head: e.target.value})} className="input">
                  <option value="">-- None --</option>
                  {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Carbon Budget (tCO₂e)</label>
                <input type="number" value={form.carbonBudget} onChange={(e) => setForm({...form, carbonBudget: e.target.value})} className="input" placeholder="1000" />
              </div>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm({...form, color: c})}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${form.color === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : modal === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
