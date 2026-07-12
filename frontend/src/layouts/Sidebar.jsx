import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Leaf, Heart, Shield,
  Trophy, BarChart3, Settings, LogOut, Globe, ChevronRight,
  Bell, X, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getRoleName } from '../utils/helpers';

const navGroups = [
  {
    label: 'Platform',
    items: [
      { to: '/dashboard/super-admin',   icon: LayoutDashboard, label: 'Platform Overview', roles: ['super_admin'] },
      { to: '/dashboard/organizations', icon: Building2,        label: 'Organizations',    roles: ['super_admin'] },
      { to: '/dashboard/gamification',  icon: Trophy,          label: 'Platform Analytics', roles: ['super_admin'] },
      { to: '/dashboard/settings',      icon: Settings,        label: 'Settings',         roles: ['super_admin'] },
    ],
  },
  {
    label: 'Overview',
    items: [
      { to: '/dashboard/ceo',        icon: LayoutDashboard, label: 'CEO Dashboard',        roles: ['ceo'] },
      { to: '/dashboard/esg',        icon: Leaf,            label: 'ESG Dashboard',        roles: ['ceo', 'esg_manager'] },
      { to: '/dashboard/hr',         icon: Users,           label: 'HR Dashboard',         roles: ['ceo', 'hr_manager'] },
      { to: '/dashboard/compliance', icon: Shield,          label: 'Compliance Dashboard', roles: ['ceo', 'compliance_officer'] },
      { to: '/dashboard/employee',   icon: LayoutDashboard, label: 'My Dashboard',         roles: ['employee'] },
    ],
  },
  {
    label: 'Organization',
    items: [
      { to: '/dashboard/departments', icon: Building2, label: 'Departments', roles: ['ceo', 'hr_manager', 'esg_manager', 'compliance_officer'] },
      { to: '/dashboard/users',       icon: Users,     label: 'User Management', roles: ['ceo'] },
    ],
  },
  {
    label: 'ESG Modules',
    items: [
      { to: '/dashboard/environmental', icon: Leaf,   label: 'Environmental', roles: ['ceo', 'esg_manager', 'employee'] },
      { to: '/dashboard/social',        icon: Heart,  label: 'Social',        roles: ['ceo', 'hr_manager', 'employee'] },
      { to: '/dashboard/governance',    icon: Shield, label: 'Governance',    roles: ['ceo', 'compliance_officer'] },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { to: '/dashboard/gamification', icon: Trophy,    label: 'Gamification', roles: ['ceo', 'hr_manager', 'esg_manager', 'employee'] },
      { to: '/dashboard/reports',      icon: BarChart3, label: 'Reports',      roles: ['ceo', 'esg_manager', 'compliance_officer'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['ceo', 'esg_manager', 'hr_manager', 'compliance_officer', 'employee'] },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out.', 'Goodbye!');
    navigate('/login');
  };

  const filteredGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => item.roles.includes(user?.role)) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 flex flex-col
          bg-white dark:bg-surface-dark-card
          border-r border-gray-100 dark:border-surface-dark-border
          shadow-xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight block">EcoSphere</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">ESG Platform</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-primary-50 dark:bg-primary-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-primary-600 dark:text-primary-400">{getRoleName(user?.role)}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) => isActive ? 'sidebar-item-active' : 'sidebar-item'}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronRight className="w-3 h-3 opacity-40" />
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700">
          <button onClick={handleLogout} className="sidebar-item w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
