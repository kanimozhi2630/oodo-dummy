import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute, RoleRedirect } from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth pages
const Login    = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));

// Dashboards
const CeoDashboard        = lazy(() => import('../pages/dashboards/CeoDashboard'));
const EsgDashboard        = lazy(() => import('../pages/dashboards/EsgDashboard'));
const HrDashboard         = lazy(() => import('../pages/dashboards/HrDashboard'));
const ComplianceDashboard = lazy(() => import('../pages/dashboards/ComplianceDashboard'));
const EmployeeDashboard   = lazy(() => import('../pages/dashboards/EmployeeDashboard'));
const SuperAdminDashboard = lazy(() => import('../pages/dashboards/SuperAdminDashboard'));

// Management pages
const Organizations  = lazy(() => import('../pages/Organizations'));
const Departments    = lazy(() => import('../pages/Departments'));
const Users          = lazy(() => import('../pages/Users'));
const Environmental  = lazy(() => import('../pages/Environmental'));
const Social         = lazy(() => import('../pages/Social'));
const Governance     = lazy(() => import('../pages/Governance'));
const Gamification   = lazy(() => import('../pages/Gamification'));
const Reports        = lazy(() => import('../pages/Reports'));
const Settings       = lazy(() => import('../pages/Settings'));
const Notifications  = lazy(() => import('../pages/Notifications'));
const Profile        = lazy(() => import('../pages/Profile'));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark"><PageLoader /></div>}>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — Dashboard shell */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleRedirect />} />

            {/* Role dashboards */}
            <Route path="super-admin" element={<RoleRoute roles={['super_admin']}><Suspense fallback={<PageLoader />}><SuperAdminDashboard /></Suspense></RoleRoute>} />
            <Route path="ceo"        element={<RoleRoute roles={['ceo']}><Suspense fallback={<PageLoader />}><CeoDashboard /></Suspense></RoleRoute>} />
            <Route path="esg"        element={<RoleRoute roles={['ceo','esg_manager']}><Suspense fallback={<PageLoader />}><EsgDashboard /></Suspense></RoleRoute>} />
            <Route path="hr"         element={<RoleRoute roles={['ceo','hr_manager']}><Suspense fallback={<PageLoader />}><HrDashboard /></Suspense></RoleRoute>} />
            <Route path="compliance" element={<RoleRoute roles={['ceo','compliance_officer']}><Suspense fallback={<PageLoader />}><ComplianceDashboard /></Suspense></RoleRoute>} />
            <Route path="employee"   element={<Suspense fallback={<PageLoader />}><EmployeeDashboard /></Suspense>} />

            {/* Shared modules */}
            <Route path="organizations" element={<RoleRoute roles={['super_admin']}><Suspense fallback={<PageLoader />}><Organizations /></Suspense></RoleRoute>} />
            <Route path="departments"   element={<Suspense fallback={<PageLoader />}><Departments /></Suspense>} />
            <Route path="users"         element={<RoleRoute roles={['ceo']}><Suspense fallback={<PageLoader />}><Users /></Suspense></RoleRoute>} />
            <Route path="environmental" element={<Suspense fallback={<PageLoader />}><Environmental /></Suspense>} />
            <Route path="social"        element={<Suspense fallback={<PageLoader />}><Social /></Suspense>} />
            <Route path="governance"    element={<Suspense fallback={<PageLoader />}><Governance /></Suspense>} />
            <Route path="gamification"  element={<Suspense fallback={<PageLoader />}><Gamification /></Suspense>} />
            <Route path="reports"       element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
            <Route path="settings"      element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            <Route path="profile"       element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
          </Route>

          {/* Redirects */}
          <Route path="/"   element={<Navigate to="/login" replace />} />
          <Route path="*"   element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
