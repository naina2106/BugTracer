import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  ListFilter, 
  FolderKanban, 
  Users, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  Sparkles, 
  Radar, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onOpenNewTicket, onOpenNewProject }) => {
  const { user, logout } = useAuth();
  const { projects, currentProject, selectProject } = useProjects();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Kanban Sprint', path: '/kanban', icon: Kanban },
    { name: 'Issues Registry', path: '/issues', icon: ListFilter },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
  ];

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Selector */}
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                <Radar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
                    BugTracer
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI PRO</span>
                  </span>
                </div>
              </div>
            </Link>

            {/* Active Project Dropdown */}
            {currentProject && (
              <div className="relative group">
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 px-3 py-1.5 rounded-xl text-sm cursor-pointer transition shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{currentProject.title}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                    {currentProject.key}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition" />
                </div>

                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 hidden group-hover:block z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Switch Workspace
                  </div>
                  {projects.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => selectProject(p)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/70 transition ${
                        currentProject._id === p._id ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-slate-800/40' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="text-xs text-slate-500 font-mono">{p.key}</span>
                    </button>
                  ))}
                  <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                  <button
                    onClick={onOpenNewProject}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center space-x-1.5 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition border border-slate-200 dark:border-slate-800"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            <button
              onClick={onOpenNewTicket}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Issue</span>
            </button>

            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name}</div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 capitalize flex items-center space-x-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{user?.role}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
