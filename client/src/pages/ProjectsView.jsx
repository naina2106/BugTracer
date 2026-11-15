import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus 
} from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

const ProjectsView = ({ onOpenNewProject }) => {
  const { projects, currentProject, selectProject, addMemberToProject, deleteProject, usersList } = useProjects();
  const { user } = useAuth();

  const [selectedProjectForInvite, setSelectedProjectForInvite] = useState(null);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('developer');
  const [inviteLoading, setInviteLoading] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!inviteUserId || !selectedProjectForInvite) return;
    try {
      setInviteLoading(true);
      await addMemberToProject(selectedProjectForInvite._id, inviteUserId, inviteRole);
      setSelectedProjectForInvite(null);
      setInviteUserId('');
    } catch (err) {
      alert(err.message || 'Failed to add member');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleDelete = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.title}"? All associated tickets will be deleted!`)) {
      await deleteProject(project._id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Project Workspaces</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your organization's projects, access control, and team members.
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-lg shadow-indigo-600/25 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isCurrent = currentProject?._id === proj._id;
          const isOwner = proj.owner?._id === user?._id || user?.role === 'admin';

          return (
            <div
              key={proj._id}
              className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'border-indigo-500 shadow-indigo-500/10 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-500/20">
                    {proj.key}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{proj.title}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {proj.description || <span className="italic text-slate-400 dark:text-slate-500">No project description.</span>}
                </p>

                {/* Team Members */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team Members ({proj.teamMembers?.length || 0})</span>
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => setSelectedProjectForInvite(proj)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center space-x-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Invite</span>
                      </button>
                    )}
                  </div>

                  <div className="flex -space-x-2 overflow-hidden py-1">
                    {proj.teamMembers?.map((m, idx) => (
                      <img
                        key={idx}
                        src={m.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.user?.name}`}
                        alt={m.user?.name}
                        title={`${m.user?.name} (${m.role})`}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => selectProject(proj)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                  }`}
                >
                  {isCurrent ? 'Current Workspace' : 'Switch Workspace'}
                </button>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(proj)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      {selectedProjectForInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Add Member to {selectedProjectForInvite.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select an existing organization member and grant role permissions.
            </p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Select User
                </label>
                <select
                  value={inviteUserId}
                  onChange={(e) => setInviteUserId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  required
                >
                  <option value="">-- Choose User --</option>
                  {usersList
                    .filter(
                      (u) =>
                        !selectedProjectForInvite.teamMembers?.some(
                          (m) => m.user?._id === u._id || m.user === u._id
                        )
                    )
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Project Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="developer">Developer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForInvite(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50"
                >
                  {inviteLoading ? 'Adding...' : 'Add to Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
