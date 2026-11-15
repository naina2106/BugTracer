import React, { useState } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { createProject } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    key: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.key) {
      setError('Please provide project name and key');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createProject(formData);
      onClose();
      setFormData({ title: '', key: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val) => {
    let keySuggestion = val
      .split(' ')
      .filter(w => w.length > 0)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 5);

    setFormData({
      ...formData,
      title: val,
      key: formData.key === '' || formData.key.length <= 4 ? keySuggestion : formData.key,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FolderPlus className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Create New Project Workspace</h2>
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="e.g. NextGen Distributed Engine"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Project Key (Prefix for ticket IDs) *
            </label>
            <input
              type="text"
              placeholder="e.g. NDE"
              maxLength={8}
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 font-mono placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase transition"
              required
            />
            <span className="text-[11px] text-slate-500">Short uppercase identifier like JIRA, BUG, API.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Project Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of the project goals..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
