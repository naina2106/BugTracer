import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Radar, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Sun, 
  Moon 
} from 'lucide-react';

const Auth = () => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'developer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(formData.name, formData.email, formData.password, formData.role);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (email, password) => {
    setIsRegister(false);
    setFormData({
      name: '',
      email,
      password,
      role: 'developer',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-200">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/25 ring-1 ring-white/20 mb-3">
            <Radar className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              BugTracer
            </h1>
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-cyan-300 border border-indigo-500/20 dark:border-cyan-500/30">
              AI 2.0
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Autonomous Issue Intelligence & Agile Sprint Operations Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm transition-colors duration-200">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
                !isRegister
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold transition border-b-2 ${
                isRegister
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Role in Organization
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 capitalize transition"
                >
                  <option value="developer">Developer / Engineer</option>
                  <option value="manager">Project Manager / Lead</option>
                  <option value="admin">Admin / DevOps</option>
                  <option value="viewer">QA / Viewer</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Register & Launch' : 'Enter BugTracer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login Quick Selectors */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider mb-3 flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
              <span>Instant 1-Click Evaluation Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@bugtracer.io', 'password123')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-300 text-left transition"
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                  <span>Admin</span>
                  <span className="text-[9px] px-1 py-0.2 bg-indigo-500/10 dark:bg-indigo-500/20 rounded">Full</span>
                </div>
                <div className="text-[10px] text-slate-500">Sarah Connor</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('alex@bugtracer.io', 'password123')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-300 text-left transition"
              >
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <span>Developer</span>
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-500/10 dark:bg-emerald-500/20 rounded">Core</span>
                </div>
                <div className="text-[10px] text-slate-500">Alex Rivera</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
