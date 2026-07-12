import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Save, User, Bell, Palette, Shield } from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { theme, setThemeMode } = useTheme();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '' });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await api.put('/auth/profile', formData);
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setThemeMode(newTheme);
    try {
      await api.put('/auth/profile', { preferences: { theme: newTheme } });
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 flex flex-col gap-1">
          {[
            { id: 'profile', icon: User, label: 'Profile Settings' },
            { id: 'preferences', icon: Palette, label: 'Appearance' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Shield, label: 'Security' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 card p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">Personal Information</h3>
              <div><label className="label">Full Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" /></div>
              <div><label className="label">Email Address</label><input value={user?.email} disabled className="input bg-gray-50 opacity-60" /></div>
              <div><label className="label">Phone Number</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input" /></div>
              <div><label className="label">Role</label><input value={user?.role?.replace('_', ' ').toUpperCase()} disabled className="input bg-gray-50 opacity-60" /></div>
              <button onClick={handleSaveProfile} disabled={loading} className="btn-primary mt-4"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg mb-4">Appearance</h3>
              <div>
                <label className="label">Theme</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button onClick={() => handleThemeChange('light')} className={`p-4 rounded-xl border-2 text-left ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="font-medium text-gray-900 dark:text-white">Light Mode</div>
                  </button>
                  <button onClick={() => handleThemeChange('dark')} className={`p-4 rounded-xl border-2 text-left ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                    <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {(activeTab === 'notifications' || activeTab === 'security') && (
            <div className="py-12 text-center text-gray-400">
              Settings for {activeTab} will be available soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
