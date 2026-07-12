import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Target, TrendingDown, BarChart3, RefreshCw, Plus } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { formatCO2, getStatusBadgeClass, formatDate, monthName } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const SCOPE_COLORS = { 'Scope 1': '#2d9866', 'Scope 2': '#3b82f6', 'Scope 3': '#8b5cf6' };
const TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' };

export default function EsgDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get('/dashboard/esg').then(({ data: res }) => setData(res)).catch(() => toast.error('Failed to load ESG data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[...Array(3)].map((_,i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[...Array(2)].map((_,i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}</div>
    </div>
  );

  const { byScope = [], goals = [], recentTransactions = [], departmentStats = [] } = data || {};

  const scopeChartData = byScope.map((s) => ({ name: s._id, value: parseFloat(s.total.toFixed(2)), color: SCOPE_COLORS[s._id] || '#6b7280' }));
  const totalCO2 = byScope.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">ESG Manager Dashboard</h1>
          <p className="page-subtitle">Environmental performance analytics and goals</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/environmental" className="btn-outline text-sm"><Plus className="w-4 h-4" /> Log Emissions</Link>
          <Link to="/dashboard/reports" className="btn-primary text-sm"><BarChart3 className="w-4 h-4" /> Reports</Link>
        </div>
      </div>

      {/* Scope breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Scope 1', 'Scope 2', 'Scope 3'].map((scope) => {
          const entry = byScope.find((s) => s._id === scope);
          const pct = totalCO2 > 0 ? ((entry?.total || 0) / totalCO2 * 100).toFixed(1) : 0;
          return (
            <div key={scope} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCOPE_COLORS[scope] }} />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{scope}</span>
                <span className="ml-auto badge badge-gray">{pct}%</span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{entry ? parseFloat(entry.total.toFixed(1)) : 0}</p>
              <p className="text-xs text-gray-400 mt-1">tCO₂e total</p>
              <div className="progress-bar mt-3">
                <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: SCOPE_COLORS[scope] }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scope pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Emissions by Scope</h3>
          {scopeChartData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={scopeChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {scopeChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v.toFixed(2)} tCO₂e`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex-1">
                {scopeChartData.map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.value.toFixed(2)} tCO₂e</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                  <p className="text-xs font-medium text-gray-500">Total</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{totalCO2.toFixed(2)} tCO₂e</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm flex-col gap-2">
              <Leaf className="w-8 h-8 opacity-40" />
              <p>No emissions data yet</p>
              <Link to="/dashboard/environmental" className="btn-primary text-xs mt-1"><Plus className="w-3 h-3" /> Log first transaction</Link>
            </div>
          )}
        </div>

        {/* Goals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Active Goals</h3>
            <Link to="/dashboard/environmental" className="text-xs text-primary-600 hover:underline">Manage →</Link>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {goals.filter((g) => g.status === 'active').slice(0, 6).map((goal) => {
              const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
              return (
                <div key={goal._id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${goal.category === 'Environmental' ? 'bg-green-500' : goal.category === 'Social' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{goal.title}</p>
                    </div>
                    <span className="text-xs font-bold text-primary-600 ml-2">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill bg-primary-500" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>{goal.currentValue} {goal.unit}</span>
                    <span>Target: {goal.targetValue} {goal.unit}</span>
                  </div>
                </div>
              );
            })}
            {goals.filter((g) => g.status === 'active').length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Target className="w-7 h-7 mx-auto mb-2 opacity-40" />
                <p>No active goals</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Grid */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Department Performance Grid</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {departmentStats.length > 0 ? departmentStats.map((dept) => {
            const usage = dept.carbonBudget > 0 ? (dept.totalEmissions / dept.carbonBudget) * 100 : 0;
            return (
              <div key={dept._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">{dept.name}</h4>
                  <span className={`badge ${dept.esgScore >= 70 ? 'badge-green' : dept.esgScore >= 40 ? 'badge-yellow' : 'badge-red'}`}>
                    ESG: {dept.esgScore}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1 mt-4">
                  <span>Carbon Budget Usage</span>
                  <span className={usage >= 100 ? 'text-red-500 font-bold' : usage >= 80 ? 'text-orange-500' : 'text-green-500'}>
                    {usage.toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar h-1.5">
                  <div className={`progress-fill ${usage >= 100 ? 'bg-red-500' : usage >= 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, usage)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{dept.totalEmissions.toFixed(1)} / {dept.carbonBudget} tCO₂e</p>
              </div>
            );
          }) : (
            <div className="col-span-full py-8 text-center text-sm text-gray-400">No department data available.</div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Emission Records</h3>
          <Link to="/dashboard/environmental" className="text-xs text-primary-600 hover:underline">View all →</Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr>
              <th>Description</th><th>Department</th><th>Scope</th><th>CO₂e (t)</th><th>Date</th><th>Status</th>
            </tr></thead>
            <tbody>
              {recentTransactions.length > 0 ? recentTransactions.map((t) => (
                <tr key={t._id}>
                  <td className="font-medium">{t.description}</td>
                  <td>{t.department?.name || '—'}</td>
                  <td><span className="badge badge-green">{t.scope}</span></td>
                  <td className="font-mono">{t.co2Equivalent?.toFixed(2)}</td>
                  <td>{formatDate(t.date)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No transactions recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
