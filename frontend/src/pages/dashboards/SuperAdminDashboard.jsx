import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, AlertTriangle, RefreshCw, Activity, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card animate-slide-up">
    <div className={`stat-icon ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/super-admin/dashboard');
      setData(res);
    } catch {
      toast.error('Failed to load Super Admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const { stats, recentOrganizations = [] } = data || {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Platform Overview</h1>
          <p className="page-subtitle">Super Admin controls and analytics</p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Organizations" value={stats?.totalOrganizations ?? 0} color="bg-blue-500" />
        <StatCard icon={CheckCircle} label="Active Organizations" value={stats?.activeOrganizations ?? 0} color="bg-green-500" />
        <StatCard icon={XCircle} label="Suspended Organizations" value={stats?.suspendedOrganizations ?? 0} color="bg-red-500" />
        <StatCard icon={Users} label="Total Global Users" value={stats?.totalUsersGlobally ?? 0} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Plan Breakdown */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Subscription Plans</h3>
          <div className="space-y-4">
            {Object.entries(stats?.plans || {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{plan}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Organizations</h3>
            <Link to="/dashboard/organizations" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          {recentOrganizations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Name</th>
                    <th className="px-4 py-3">Industry</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrganizations.map(org => (
                    <tr key={org._id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{org.name}</td>
                      <td className="px-4 py-3 text-gray-500">{org.industry}</td>
                      <td className="px-4 py-3">
                        <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">{org.subscriptionPlan}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${org.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                          {org.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No organizations found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
