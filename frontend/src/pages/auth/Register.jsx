import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Globe, Eye, EyeOff, Sun, Moon, CheckCircle, ArrowRight, Building2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const INDUSTRIES = [
  'Technology', 'Manufacturing', 'Healthcare', 'Finance', 'Energy',
  'Retail', 'Education', 'Agriculture', 'Construction', 'Transportation',
  'Hospitality', 'Media', 'Telecommunications', 'Other',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Germany', 'France', 'Australia',
  'Canada', 'Singapore', 'UAE', 'Japan', 'China', 'Brazil', 'South Africa', 'Other',
];

export default function Register() {
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Company info, 2: Admin info

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    defaultValues: { companySize: '11-50', industry: 'Technology', country: 'India' },
  });

  const password = watch('password');

  const nextStep = async () => {
    const valid = await trigger(['companyName', 'companyEmail', 'companyPhone', 'industry', 'country', 'companySize', 'numberOfEmployees']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!data.acceptTerms) {
      toast.error('Please accept the terms and conditions.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        companyName: data.companyName,
        companyEmail: data.companyEmail,
        companyPhone: data.companyPhone,
        industry: data.industry,
        country: data.country,
        companySize: data.companySize,
        numberOfEmployees: parseInt(data.numberOfEmployees),
        adminName: data.adminName,
        adminEmail: data.adminEmail,
        password: data.password,
      });
      toast.success('Company registered successfully! Please login.', 'Welcome to EcoSphere 🌿');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">EcoSphere</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Register Your Company</h1>
          <p className="text-gray-400">Start your ESG management journey today</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Theme + Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm font-medium ${step >= 1 ? 'text-primary-400' : 'text-gray-600'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step >= 1 ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-600 text-gray-500'}`}>
                  {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                </span>
                Company Info
              </div>
              <div className="w-12 h-0.5 bg-gray-600" />
              <div className={`flex items-center gap-2 text-sm font-medium ${step === 2 ? 'text-primary-400' : 'text-gray-600'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${step === 2 ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-600 text-gray-500'}`}>2</span>
                Admin Account
              </div>
            </div>
            <button onClick={toggleTheme} className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Name *</label>
                    <input
                      {...register('companyName', { required: 'Company name is required' })}
                      placeholder="Acme Corporation"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                    {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Email *</label>
                    <input
                      {...register('companyEmail', { required: 'Company email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      type="email"
                      placeholder="contact@acme.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                    {errors.companyEmail && <p className="text-red-400 text-xs mt-1">{errors.companyEmail.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Phone *</label>
                    <input
                      {...register('companyPhone', { required: 'Phone is required' })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                    {errors.companyPhone && <p className="text-red-400 text-xs mt-1">{errors.companyPhone.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Industry *</label>
                    <select
                      {...register('industry', { required: true })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      {INDUSTRIES.map((i) => <option key={i} value={i} className="bg-gray-800">{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Country *</label>
                    <select
                      {...register('country', { required: true })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      {COUNTRIES.map((c) => <option key={c} value={c} className="bg-gray-800">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company Size *</label>
                    <select
                      {...register('companySize', { required: true })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      {COMPANY_SIZES.map((s) => <option key={s} value={s} className="bg-gray-800">{s} employees</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Number of Employees *</label>
                    <input
                      {...register('numberOfEmployees', { required: 'Required', min: { value: 1, message: 'Must be at least 1' } })}
                      type="number"
                      placeholder="250"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                    {errors.numberOfEmployees && <p className="text-red-400 text-xs mt-1">{errors.numberOfEmployees.message}</p>}
                  </div>
                </div>
                <button type="button" onClick={nextStep} className="btn-primary w-full mt-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 mb-4">
                  <Building2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Creating account for</p>
                    <p className="text-sm font-semibold text-white">{watch('companyName')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Name *</label>
                    <input
                      {...register('adminName', { required: 'Admin name is required' })}
                      placeholder="John Smith"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                    {errors.adminName && <p className="text-red-400 text-xs mt-1">{errors.adminName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Admin Email *</label>
                    <input
                      {...register('adminEmail', { required: 'Admin email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      type="email"
                      placeholder="admin@acme.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                    />
                    {errors.adminEmail && <p className="text-red-400 text-xs mt-1">{errors.adminEmail.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Password *</label>
                    <div className="relative">
                      <input
                        {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <input
                        {...register('confirmPassword', {
                          required: 'Please confirm password',
                          validate: (val) => val === password || 'Passwords do not match',
                        })}
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-all"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" {...register('acceptTerms')} className="mt-0.5 accent-primary-500" />
                  <span className="text-sm text-gray-400">
                    I agree to the <span className="text-primary-400 hover:underline cursor-pointer">Terms of Service</span> and{' '}
                    <span className="text-primary-400 hover:underline cursor-pointer">Privacy Policy</span>
                  </span>
                </label>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 border border-white/10 text-gray-300">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <> Create Account <ArrowRight className="w-4 h-4" /> </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
