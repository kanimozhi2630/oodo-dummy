import { useState, useEffect } from 'react';
import { Leaf, Plus, Target, Factory } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCO2, getStatusBadgeClass } from '../utils/helpers';

export default function Environmental() {
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, goals, factors
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [factors, setFactors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ceo', 'esg_manager');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [transRes, goalsRes, factorRes, deptRes] = await Promise.all([
          api.get('/environmental/transactions'),
          api.get('/environmental/goals'),
          api.get('/environmental/emission-factors'),
          api.get('/departments')
        ]);
        setTransactions(transRes.data.transactions);
        setGoals(goalsRes.data.goals);
        setFactors(factorRes.data.factors);
        setDepartments(deptRes.data.departments);
      } catch {
        toast.error('Failed to load environmental data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Environmental Management</h1>
          <p className="page-subtitle">Track emissions, set goals, and manage emission factors</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { id: 'transactions', label: 'Emissions', icon: Leaf },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'factors', label: 'Factors', icon: Factory },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-5"><div className="skeleton h-64 rounded-xl" /></div>
      ) : activeTab === 'transactions' ? (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Carbon Transactions</h3>
            {canEdit && <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> Log Emissions</button>}
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Description</th><th>Department</th><th>Scope</th><th>Factor</th><th>CO₂e (t)</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {transactions.length > 0 ? transactions.map(t => (
                  <tr key={t._id}>
                    <td className="font-medium">{t.description}</td>
                    <td>{t.department?.name || '—'}</td>
                    <td><span className="badge badge-green">{t.scope}</span></td>
                    <td>{t.emissionFactor?.name}</td>
                    <td className="font-mono">{t.co2Equivalent?.toFixed(2)}</td>
                    <td>{formatDate(t.date)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(t.status)}`}>{t.status}</span></td>
                  </tr>
                )) : <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transactions found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'goals' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const progress = goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0;
            return (
              <div key={goal._id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${getStatusBadgeClass(goal.status)}`}>{goal.status}</span>
                  <span className="text-xs text-gray-400">Target: {formatDate(goal.targetDate)}</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{goal.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{goal.description}</p>
                
                <div className="flex justify-between items-end mb-1">
                  <span className="text-2xl font-bold">{progress}%</span>
                  <span className="text-xs text-gray-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill bg-primary-500" style={{ width: `${progress}%` }} /></div>
              </div>
            );
          })}
          {goals.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No goals set</div>}
        </div>
      ) : (
        <div className="card p-5">
           <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Emission Factors</h3>
            {canEdit && <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add Factor</button>}
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Name</th><th>Category</th><th>Sub-Category</th><th>Value</th><th>Unit</th><th>Source</th></tr></thead>
              <tbody>
                {factors.length > 0 ? factors.map(f => (
                  <tr key={f._id}>
                    <td className="font-medium">{f.name}</td>
                    <td><span className="badge badge-gray">{f.category}</span></td>
                    <td>{f.subCategory}</td>
                    <td className="font-mono">{f.factorValue}</td>
                    <td>{f.unit}</td>
                    <td>{f.source} ({f.year})</td>
                  </tr>
                )) : <tr><td colSpan={6} className="text-center py-8 text-gray-400">No emission factors found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
