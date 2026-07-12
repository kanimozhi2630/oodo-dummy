import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, FileText, Plus } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, getStatusBadgeClass, getSeverityClass } from '../utils/helpers';

export default function Governance() {
  const [activeTab, setActiveTab] = useState('issues');
  const [issues, setIssues] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const toast = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole('ceo', 'compliance_officer');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [issuesRes, policiesRes, auditsRes] = await Promise.all([
          api.get('/governance/issues'),
          api.get('/governance/policies'),
          api.get('/governance/audits'),
        ]);
        setIssues(issuesRes.data.issues);
        setPolicies(policiesRes.data.policies);
        setAudits(auditsRes.data.audits);
      } catch {
        toast.error('Failed to load governance data');
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
          <h1 className="page-title">Governance & Compliance</h1>
          <p className="page-subtitle">Manage policies, audits, and compliance issues</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { id: 'issues', label: 'Issues', icon: AlertTriangle },
            { id: 'policies', label: 'Policies', icon: FileText },
            { id: 'audits', label: 'Audits', icon: Shield },
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
      ) : activeTab === 'issues' ? (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Compliance Issues</h3>
            <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> Log Issue</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Category</th><th>Severity</th><th>Reported By</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {issues.map(i => (
                  <tr key={i._id}>
                    <td className="font-medium">{i.title}</td>
                    <td>{i.category}</td>
                    <td><span className={`badge ${getSeverityClass(i.severity)}`}>{i.severity}</span></td>
                    <td>{i.reportedBy?.name}</td>
                    <td>{formatDate(i.dueDate)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(i.status)}`}>{i.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
                {issues.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">No compliance issues found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'policies' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map(p => (
            <div key={p._id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <span className={`badge ${getStatusBadgeClass(p.status)}`}>{p.status}</span>
                <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">v{p.version}</span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">{p.title}</h4>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{p.description}</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Category: {p.category}</p>
                <p>Effective: {formatDate(p.effectiveDate)}</p>
                <p>Review: {formatDate(p.reviewDate)}</p>
              </div>
            </div>
          ))}
          {policies.length === 0 && <div className="col-span-3 text-center py-8 text-gray-400">No policies found</div>}
        </div>
      ) : (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Audits</h3>
            {canEdit && <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> Schedule Audit</button>}
          </div>
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Type</th><th>Conducted By</th><th>Start</th><th>End</th><th>Status</th><th>Score</th></tr></thead>
              <tbody>
                {audits.map(a => (
                  <tr key={a._id}>
                    <td className="font-medium">{a.title}</td>
                    <td>{a.type}</td>
                    <td>{a.conductedBy?.name}</td>
                    <td>{formatDate(a.startDate)}</td>
                    <td>{formatDate(a.endDate)}</td>
                    <td><span className={`badge ${getStatusBadgeClass(a.status)}`}>{a.status.replace('_', ' ')}</span></td>
                    <td className="font-bold">{a.score || '—'}</td>
                  </tr>
                ))}
                {audits.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">No audits found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
