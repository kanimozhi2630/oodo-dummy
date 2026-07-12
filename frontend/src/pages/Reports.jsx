import { useState } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleDownload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Report downloaded successfully as PDF.');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">ESG Reports</h1>
          <p className="page-subtitle">Generate and download comprehensive ESG reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="btn-secondary"><Printer className="w-4 h-4" /> Print</button>
          <button onClick={handleDownload} disabled={loading} className="btn-primary">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Download className="w-4 h-4" /> Export PDF</>}
          </button>
        </div>
      </div>

      <div className="card p-8 min-h-[600px] flex flex-col items-center justify-center text-center border-dashed border-2 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Annual ESG Report</h2>
        <p className="text-gray-500 max-w-md mb-6">Select report type, date range, and modules to generate a customized PDF report for stakeholders.</p>
        
        <div className="w-full max-w-md space-y-4 text-left">
          <div><label className="label">Report Type</label><select className="input"><option>Comprehensive ESG</option><option>Environmental Only</option><option>Social & Governance</option></select></div>
          <div><label className="label">Date Range</label><select className="input"><option>Year to Date</option><option>Last Year</option><option>Last Quarter</option></select></div>
          <button onClick={handleDownload} className="btn-primary w-full py-3 mt-4">Generate Report</button>
        </div>
      </div>
    </div>
  );
}
