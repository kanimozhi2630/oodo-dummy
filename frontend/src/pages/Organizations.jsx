import { Building2 } from 'lucide-react';

export default function Organizations() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Organizations</h1>
        <p className="page-subtitle">Manage platform tenants</p>
      </div>

      <div className="card p-10 flex flex-col items-center justify-center text-center">
        <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Coming Soon</h3>
        <p className="text-sm text-gray-500 max-w-sm mt-2">
          Organization management is under development. You will soon be able to add, suspend, and configure platform tenants here.
        </p>
      </div>
    </div>
  );
}
