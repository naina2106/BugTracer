import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Bot, Target, Clock } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { apiFetch } from '../services/api';

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const { currentProject, projects, usersList } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bug',
    priority: 'medium',
    status: 'To Do',
    projectId: currentProject?._id || '',
    assignee: '',
    storyPoints: 3,
    slaDays: 3,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Please provide a ticket title');
      return;
    }

    const targetProjectId = formData.projectId || currentProject?._id || (projects[0] && projects[0]._id);
    if (!targetProjectId) {
      setError('Please select or create a project first');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        ...formData,
        projectId: targetProjectId,
      };

      const res = await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        if (file && res.data._id) {
          const uploadData = new FormData();
          uploadData.append('file', file);
          await apiFetch(`/tickets/${res.data._id}/attachments`, {
            method: 'POST',
            body: uploadData,
          });
        }

        onTicketCreated();
        onClose();
        setFormData({
          title: '',
          description: '',
          type: 'bug',
          priority: 'medium',
          status: 'To Do',
          projectId: currentProject?._id || '',
          assignee: '',
          storyPoints: 3,
          slaDays: 3,
        });
        setFile(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Log Issue in BugTracer</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">AI automatically scans description & generates root cause analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-2 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Project selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Target Project Workspace
            </label>
            <select
              value={formData.projectId || currentProject?._id || ''}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.key})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Issue Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Memory leak in Redis caching tier during batch sync"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          {/* Type, Priority & Status Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 capitalize transition"
              >
                <option value="bug">🐛 Bug</option>
                <option value="feature">✨ Feature</option>
                <option value="task">📋 Task</option>
                <option value="improvement">⚡ Improvement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 capitalize transition"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Story Points & SLA Days Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Story Points</span>
              </label>
              <input
                type="number"
                min="1"
                max="21"
                value={formData.storyPoints}
                onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>SLA Target (Days)</span>
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.slaDays}
                onChange={(e) => setFormData({ ...formData, slaDays: parseInt(e.target.value) || 3 })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            <select
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="">Unassigned</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Error Logs / Detailed Description
            </label>
            <textarea
              rows={3}
              placeholder="Paste error stack trace or describe issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>

          {/* File Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Attachment (Screenshot / Crash Log)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-600/20 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-600/30 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Log Issue & Run AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
