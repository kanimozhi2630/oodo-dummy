import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Trophy, Plus, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { Check, X } from 'lucide-react';

const COLORS = ['#2d9866', '#3b82f6', '#f59e0b', '#ef4444'];
const TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' };

export default function HrDashboard() {
  const [data, setData] = useState(null);
  const [pendingProofs, setPendingProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadData = () => {
    Promise.all([
      api.get('/dashboard/hr'),
      api.get('/proofs/pending?limit=5')
    ]).then(([dashRes, proofRes]) => {
      setData(dashRes.data);
      setPendingProofs(proofRes.data.proofs || []);
    }).catch(() => toast.error('Failed to load HR data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleReviewProof = async (id, status) => {
    try {
      await api.put(`/proofs/${id}/review`, { status, pointsAwarded: status === 'approved' ? 50 : 0 });
      toast.success(`Proof ${status} successfully.`);
      loadData();
    } catch (err) {
      toast.error('Failed to review proof');
    }
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_,i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
    </div>
  );

  const { employees = 0, activities = [], upcomingActivities = [] } = data || {};
  const activityMap = activities.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {});
  const activityChartData = [
    { name: 'Upcoming', count: activityMap.upcoming || 0, color: '#3b82f6' },
    { name: 'Ongoing',  count: activityMap.ongoing  || 0, color: '#f59e0b' },
    { name: 'Completed',count: activityMap.completed || 0, color: '#2d9866' },
    { name: 'Cancelled',count: activityMap.cancelled || 0, color: '#ef4444' },
  ];
  const totalActivities = activities.reduce((s, a) => s + a.count, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">HR Dashboard</h1>
          <p className="page-subtitle">Employee management and CSR activities overview</p>
        </div>
        <Link to="/dashboard/social" className="btn-primary text-sm"><Plus className="w-4 h-4" /> New CSR Activity</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,    label: 'Total Employees',     value: employees,      color: 'bg-blue-500' },
          { icon: Heart,    label: 'Total CSR Activities', value: totalActivities, color: 'bg-pink-500' },
          { icon: Trophy,   label: 'Completed Activities', value: activityMap.completed || 0, color: 'bg-green-500' },
          { icon: Calendar, label: 'Upcoming Activities',  value: activityMap.upcoming  || 0, color: 'bg-orange-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card animate-slide-up">
            <div className={`stat-icon ${color}`}><Icon className="w-6 h-6 text-white" /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity status chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">CSR Activity Status</h3>
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={activityChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count">
                  {activityChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {activityChartData.map((a) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: a.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{a.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming activities */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Activities</h3>
            <Link to="/dashboard/social" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {upcomingActivities.length > 0 ? upcomingActivities.map((activity) => (
              <div key={activity._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/20">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                  <p className="text-xs text-gray-400">{activity.category} · {formatDate(activity.startDate)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${getStatusBadgeClass(activity.status)}`}>{activity.status}</span>
                    <span className="text-xs text-gray-400">{activity.currentParticipants}/{activity.maxParticipants || '∞'} joined</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Calendar className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p>No upcoming activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Proof Reviews */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Pending Proof Reviews</h3>
            <p className="text-xs text-gray-400">Review employee challenge submissions</p>
          </div>
        </div>
        <div className="space-y-4">
          {pendingProofs.length > 0 ? pendingProofs.map((proof) => (
            <div key={proof._id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{proof.user?.name}</span>
                  <span className="text-xs text-gray-500">submitted for</span>
                  <span className="text-sm font-medium text-primary-600 truncate">{proof.challenge?.title}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Notes: {proof.notes || 'N/A'}</p>
                {proof.proofUrl && (
                  <a href={proof.proofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">View Evidence</a>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleReviewProof(proof._id, 'rejected')} className="btn-secondary text-red-500 hover:text-red-600 hover:bg-red-50 p-2"><X className="w-4 h-4" /></button>
                <button onClick={() => handleReviewProof(proof._id, 'approved')} className="btn-primary p-2"><Check className="w-4 h-4" /></button>
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-sm text-gray-400">No pending proofs to review.</div>
          )}
        </div>
      </div>
    </div>
  );
}
