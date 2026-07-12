import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Globe, Eye, EyeOff, Sun, Moon, Leaf, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLE_DASHBOARDS = {
  super_admin: '/dashboard/super-admin',
  ceo: '/dashboard/ceo',
  esg_manager: '/dashboard/esg',
  hr_manager: '/dashboard/hr',
  compliance_officer: '/dashboard/compliance',
  employee: '/dashboard/employee',
};

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const fillDemo = (email) => {
    setValue('email', email);
    setValue('password', 'admin123');
  };

  const onSubmit = async ({ email, password, rememberMe }) => {
    setLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      toast.success(`Welcome back, ${user.name}!`, 'Login Successful 🌿');
      const from = location.state?.from?.pathname;
      const dest = from || ROLE_DASHBOARDS[user.role] || '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-gray-900 to-gray-950 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-primary-950" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-primary-400/20"
              style={{
                width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Manage Your ESG<br />Journey With Ease
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-sm">
            Track emissions, drive sustainability goals, and build a greener future for your organization.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { icon: Leaf, label: 'Environmental', color: 'from-green-600 to-green-700' },
              { icon: Globe, label: 'Social', color: 'from-blue-600 to-blue-700' },
              { icon: Globe, label: 'Governance', color: 'from-purple-600 to-purple-700' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="card p-4 text-center bg-white/5 border-white/10">
                <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EcoSphere</span>
          </div>

          {/* Theme toggle */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back</h1>
              <p className="text-gray-400 mt-1">Sign in to your account</p>
            </div>
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Form card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                  })}
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <button type="button" className="text-xs text-primary-400 hover:underline">Forgot password?</button>
                </div>
                <div className="relative">
                  <input
                    {...register('password', { required: 'Password is required' })}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...register('rememberMe')} type="checkbox" className="accent-primary-500 w-4 h-4" />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <> Sign In <ArrowRight className="w-4 h-4" /> </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-400 hover:underline font-medium">Register your company</Link>
              </p>
            </div>
          </div>

          {/* Demo Accounts Section */}
          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider text-center">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'Super Admin', email: 'admin@ecosphere.com' },
                { role: 'CEO', email: 'ceo@greentech.com' },
                { role: 'ESG Manager', email: 'esg@greentech.com' },
                { role: 'HR Manager', email: 'hr@greentech.com' },
                { role: 'Compliance', email: 'compliance@greentech.com' },
                { role: 'Employee', email: 'employee1@greentech.com' },
              ].map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="p-3 text-left bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group"
                >
                  <p className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">{acc.role}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{acc.email}</p>
                  <p className="text-[9px] text-primary-400/80 truncate mt-0.5">Pass: admin123</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-6">
            © {new Date().getFullYear()} EcoSphere ESG Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}
