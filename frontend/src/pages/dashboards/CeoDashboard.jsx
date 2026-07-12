import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building2, Leaf, Shield, Trophy, TrendingUp, TrendingDown,
  AlertTriangle, Target, BarChart3, Plus, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { formatNumber, formatCO2, getEsgScoreColor, monthName } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="stat-card animate-slide-up">
    <div className={`stat-icon ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  </div>
);

const COLORS = ['#2d9866', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const CUSTOM_TOOLTIP_STYLE = {
  backgroundColor: 'var(--tooltip-bg, #1e293b)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#e2e8f0',
};

export default function CeoDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/dashboard/ceo');
      setData(res);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const { stats, topUsers = [], monthlyTrend = [], deptRankings = [] } = data || {};

  // Prepare chart data
  const trendChartData = monthlyTrend.map((m) => ({
    name: `${monthName(m._id.month)} '${String(m._id.year).slice(2)}`,
    'CO₂ (t)': parseFloat(m.total.toFixed(2)),
  }));

  const scopeData = [
    { name: 'Scope 1', value: 0, color: '#2d9866' },
    { name: 'Scope 2', value: 0, color: '#3b82f6' },
    { name: 'Scope 3', value: 0, color: '#8b5cf6' },
  ];

  const esgScore = stats?.esgScore ?? 0;
  const esgColor = getEsgScoreColor(esgScore);
  const esgGradient = esgScore >= 80 ? 'from-green-500 to-emerald-600' : esgScore >= 60 ? 'from-blue-500 to-cyan-600' : esgScore >= 40 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-rose-600';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">CEO Dashboard</h1>
          <p className="page-subtitle">Real-time ESG performance across your organization</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="btn-secondary text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link to="/dashboard/reports" className="btn-primary text-sm">
            <BarChart3 className="w-4 h-4" /> Full Report
          </Link>
        </div>
      </div>

      {/* ESG Score hero */}
      <div className={`bg-gradient-to-br ${esgGradient} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Overall ESG Score</p>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-6xl font-black">{esgScore}</span>
              <span className="text-2xl font-bold opacity-70 mb-2">/ 100</span>
            </div>
            <p className="text-sm opacity-70 mt-1">
              {esgScore >= 80 ? '🏆 Excellent ESG performance' : esgScore >= 60 ? '📈 Good — keep improving' : esgScore >= 40 ? '⚠️ Needs attention' : '🚨 Critical — immediate action needed'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['Environmental', 'Social', 'Governance'].map((cat, i) => (
              <div key={cat} className="text-center">
                <div className="text-3xl font-bold">{Math.max(0, esgScore + (i * 5 - 5))}</div>
                <div className="text-xs opacity-70 mt-1">{cat}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full h-2 bg-white/20 rounded-full">
            <div className="h-2 bg-white rounded-full transition-all duration-700" style={{ width: `${esgScore}%` }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={Users}         label="Employees"       value={formatNumber(stats?.totalEmployees)}   color="bg-blue-500"   sub="Active users" />
        <StatCard icon={Building2}     label="Departments"     value={stats?.totalDepartments ?? 0}          color="bg-purple-500" sub="Active depts" />
        <StatCard icon={Leaf}          label="Carbon Emissions" value={formatCO2(stats?.totalCarbonEmissions).split(' ')[0]} color="bg-green-600" sub="tCO₂e total" />
        <StatCard icon={Shield}        label="Open Issues"     value={stats?.openComplianceIssues ?? 0}      color={stats?.openComplianceIssues > 0 ? 'bg-red-500' : 'bg-green-500'} sub="Compliance" />
        <StatCard icon={Trophy}        label="CSR Activities"  value={stats?.csrActivities ?? 0}             color="bg-orange-500" sub="All time" />
        <StatCard icon={Target}        label="Active Goals"    value={stats?.activeGoals ?? 0}               color="bg-teal-500"   sub="In progress" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon trend */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Carbon Emissions Trend</h3>
              <p className="text-xs text-gray-400">Monthly CO₂ equivalent (tCO₂e)</p>
            </div>
            <span className="badge badge-green text-xs">6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendChartData}>
              <defs>
                <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d9866" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2d9866" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="CO₂ (t)" stroke="#2d9866" fill="url(#co2Gradient)" strokeWidth={2} dot={{ r: 4, fill: '#2d9866' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department rankings */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Department ESG Rankings</h3>
              <p className="text-xs text-gray-400">ESG score by department</p>
            </div>
          </div>
          {deptRankings.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptRankings.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={CUSTOM_TOOLTIP_STYLE} />
                <Bar dataKey="esgScore" fill="#3b82f6" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: '#94a3b8' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No departments yet</p>
                <Link to="/dashboard/departments" className="btn-primary mt-3 text-xs"><Plus className="w-3 h-3" /> Add Department</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Top Performers</h3>
              <p className="text-xs text-gray-400">Employee leaderboard</p>
            </div>
            <Link to="/dashboard/gamification" className="text-xs text-primary-600 hover:underline font-medium">View all →</Link>
          </div>
          {topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((entry, i) => (
                <div key={entry._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-yellow-100 text-yellow-600' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-primary-50 text-primary-600'
                  }`}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {entry.user?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.user?.name}</p>
                    <p className="text-xs text-gray-400">{entry.user?.role?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">{entry.totalPoints ?? 0}</p>
                    <p className="text-xs text-gray-400">points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No activity data yet</div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Add Employee',      to: '/dashboard/users',         icon: Users,      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Add Department',    to: '/dashboard/departments',    icon: Building2,  color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Log Emissions',     to: '/dashboard/environmental',  icon: Leaf,       color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
              { label: 'Create Goal',       to: '/dashboard/environmental',  icon: Target,     color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
              { label: 'View Reports',      to: '/dashboard/reports',        icon: BarChart3,  color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Compliance Issues', to: '/dashboard/governance',     icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
            ].map(({ label, to, icon: Icon, color }) => (
              <Link key={label} to={to} className={`flex items-center gap-3 p-3 rounded-xl hover:opacity-80 transition-all ${color}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
