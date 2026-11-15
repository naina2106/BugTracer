import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  Gauge,
  Zap,
  Target
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ onSelectTicket }) => {
  const { currentProject } = useProjects();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const query = currentProject ? `?projectId=${currentProject._id}` : '';
      const res = await apiFetch(`/dashboard/stats${query}`);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentProject]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Enterprise Executive Banner */}
      <div className="bg-gradient-to-r from-indigo-100/80 via-white to-cyan-50 dark:from-indigo-950/70 dark:via-slate-900 dark:to-cyan-950/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden transition-colors duration-200">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-cyan-400 mb-1 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BugTracer Sprint Intelligence Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            {currentProject ? (
              <span>Active Workspace: <strong className="text-slate-800 dark:text-slate-200">{currentProject.title}</strong> ({currentProject.key})</span>
            ) : (
              'Enterprise-wide real-time telemetry across all tracked projects.'
            )}
          </p>
        </div>

        {/* Sprint SLA & Story Points Badges */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 shadow-sm dark:shadow-lg flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">SLA Health Score</div>
              <div className="text-lg font-black text-cyan-600 dark:text-cyan-300">
                {stats?.sla?.healthScore || 100}%
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-4 shadow-sm dark:shadow-lg flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400">Story Velocity</div>
              <div className="text-lg font-black text-amber-600 dark:text-amber-300">
                {stats?.velocity?.completedPoints || 0} / {stats?.velocity?.totalPoints || 0} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Issues</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">{stats?.counts?.total || 0}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
            <Zap className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
            <span>{stats?.types?.bug || 0} bugs, {stats?.types?.feature || 0} features</span>
          </div>
        </div>

        {/* SLA Breached Alert Card */}
        <div className={`rounded-2xl p-5 shadow-sm dark:shadow-lg border transition-colors duration-200 ${
          stats?.sla?.breached > 0 
            ? 'border-rose-300 dark:border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/10' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">SLA Breaches</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-3">{stats?.sla?.breached || 0}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats?.sla?.atRisk || 0} tickets nearing 24h deadline
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-3">{stats?.counts?.inProgress || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Active sprint items</div>
        </div>

        {/* Resolved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-lg transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3">{stats?.counts?.done || 0}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats?.velocity?.percentage || 0}% sprint completion rate
          </div>
        </div>
      </div>

      {/* Analytics & AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg space-y-4 transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Severity Tiers</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Critical (1-day SLA)
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{stats?.priorities?.critical || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.counts?.total ? (stats.priorities.critical / stats.counts.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> High (2-day SLA)
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{stats?.priorities?.high || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.counts?.total ? (stats.priorities.high / stats.counts.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">🟡 Medium</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{stats?.priorities?.medium || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.counts?.total ? (stats.priorities.medium / stats.counts.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">🟢 Low</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">{stats?.priorities?.low || 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.counts?.total ? (stats.priorities.low / stats.counts.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Classification Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg space-y-4 transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Classification Matrix</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-lg font-black text-rose-600 dark:text-rose-400">{stats?.types?.bug || 0}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">🐛 Bug Defects</div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{stats?.types?.feature || 0}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">✨ Features</div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-lg font-black text-cyan-600 dark:text-cyan-400">{stats?.types?.task || 0}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">📋 Tasks</div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-lg font-black text-amber-600 dark:text-amber-400">{stats?.types?.improvement || 0}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">⚡ Tech Debts</div>
            </div>
          </div>
        </div>

        {/* Real-time Triage Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-lg space-y-4 transition-colors duration-200">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center justify-between">
            <span>Sprint Telemetry</span>
            <span className="text-[10px] text-indigo-600 dark:text-cyan-400 font-mono font-bold">LIVE</span>
          </h3>
          <div className="space-y-2.5">
            {stats?.recentTickets && stats.recentTickets.length > 0 ? (
              stats.recentTickets.map((t) => (
                <div
                  key={t._id}
                  onClick={() => onSelectTicket(t._id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/40 cursor-pointer transition group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center space-x-1.5">
                      <span>{t.projectId?.key}-{t._id.slice(-4).toUpperCase()}</span>
                      <span>•</span>
                      <span className={t.status === 'Done' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500'}>{t.status}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition" />
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 italic text-center py-6">No recent updates</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
