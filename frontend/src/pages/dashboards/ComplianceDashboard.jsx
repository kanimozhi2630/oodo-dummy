import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, Clock, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { getStatusBadgeClass, getSeverityClass, formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const SEVERITY_COLORS = { low: '#2d9866', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const STATUS_COLORS = { open: '#ef4444', in_progress: '#f59e0b', resolved: '#2d9866', closed: '#6b7280' };
const TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' };

export default function ComplianceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/dashboard/compliance').then(({ data: res }) => setData(res)).catch(() => toast.error('Failed to load compliance data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_,i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
    </div>
  );

  const { issuesBySeverity = [], issuesByStatus = [], recentAudits = [] } = data || {};
  const severityData = issuesBySeverity.map((s) => ({ name: s._id, count: s.count, color: SEVERITY_COLORS[s._id] || '#6b7280' }));
  const statusData = issuesByStatus.map((s) => ({ name: s._id.replace('_', ' '), count: s.count, color: STATUS_COLORS[s._id] || '#6b7280' }));
  const totalIssues = issuesByStatus.reduce((s, i) => s + i.count, 0);
  const openIssues = issuesByStatus.find((i) => i._id === 'open')?.count || 0;
  const resolvedIssues = issuesByStatus.find((i) => i._id === 'resolved')?.count || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-subtitle">Governance, audits, and compliance management</p>
        </div>
        <Link to="/dashboard/governance" className="btn-primary text-sm"><Plus className="w-4 h-4" /> Log Issue</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: 'Total Issues',    value: totalIssues,    color: 'bg-gray-500' },
          { icon: Shield,        label: 'Open Issues',     value: openIssues,     color: openIssues > 0 ? 'bg-red-500' : 'bg-green-500' },
          { icon: CheckCircle,   label: 'Resolved',        value: resolvedIssues, color: 'bg-green-500' },
          { icon: Clock,         label: 'Recent Audits',   value: recentAudits.length, color: 'bg-blue-500' },
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
        {/* Severity chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Issues by Severity</h3>
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
              <CheckCircle className="w-8 h-8 text-green-400 opacity-60" />
              <p>No issues reported 🎉</p>
            </div>
          )}
        </div>

        {/* Status pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Issues by Status</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="count">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Recent audits */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Audits</h3>
          <Link to="/dashboard/governance" className="text-xs text-primary-600 hover:underline">View all →</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Title</th><th>Type</th><th>Start</th><th>End</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>
              {recentAudits.length > 0 ? recentAudits.map((a) => (
                <tr key={a._id}>
                  <td className="font-medium">{a.title}</td>
                  <td>{a.type}</td>
                  <td>{formatDate(a.startDate)}</td>
                  <td>{formatDate(a.endDate)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(a.status)}`}>{a.status.replace('_', ' ')}</span></td>
                  <td className="font-bold text-primary-600">{a.score ?? '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No audits yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
