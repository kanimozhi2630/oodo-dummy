import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_DASHBOARDS = {
  super_admin: '/dashboard/super-admin',
  ceo: '/dashboard/ceo',
  esg_manager: '/dashboard/esg',
  hr_manager: '/dashboard/hr',
  compliance_officer: '/dashboard/compliance',
  employee: '/dashboard/employee',
};

// Guard: must be authenticated
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading EcoSphere…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Guard: specific roles only
export function RoleRoute({ children, roles }) {
  const { user } = useAuth();

  if (!roles.includes(user?.role)) {
    const dashboard = ROLE_DASHBOARDS[user?.role] || '/login';
    return <Navigate to={dashboard} replace />;
  }

  return children;
}

// Auto-redirect based on role
export function RoleRedirect() {
  const { user } = useAuth();
  const dest = ROLE_DASHBOARDS[user?.role] || '/login';
  return <Navigate to={dest} replace />;
}
