import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Send, 
  Paperclip, 
  Clock, 
  Sparkles, 
  Bot, 
  ShieldAlert, 
  ExternalLink,
  MessageSquare,
  History,
  Target,
  RefreshCw
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';

const TicketDetailModal = ({ ticketId, isOpen, onClose, onTicketUpdated, onTicketDeleted }) => {
  const { user } = useAuth();
  const { usersList } = useProjects();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchTicketDetails = async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const res = await apiFetch(`/tickets/${ticketId}`);
      if (res.success) {
        setTicket(res.data);
        setComments(res.data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails();
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await apiFetch(`/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.success) {
        setTicket(res.data);
        onTicketUpdated();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      const res = await apiFetch(`/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ priority: newPriority }),
      });
      if (res.success) {
        setTicket(res.data);
        onTicketUpdated();
      }
    } catch (err) {
      console.error('Priority update failed:', err);
    }
  };

  const handleAssigneeChange = async (newAssignee) => {
    try {
      const res = await apiFetch(`/tickets/${ticketId}`, {
        method: 'PUT',
        body: JSON.stringify({ assignee: newAssignee || null }),
      });
      if (res.success) {
        setTicket(res.data);
        onTicketUpdated();
      }
    } catch (err) {
      console.error('Assignee update failed:', err);
    }
  };

  const handleRunAIAnalysis = async () => {
    try {
      setAnalyzingAI(true);
      const res = await apiFetch(`/tickets/${ticketId}/analyze-ai`, {
        method: 'POST',
      });
      if (res.success) {
        setTicket(res.data);
        onTicketUpdated();
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setCommentSubmitting(true);
      const res = await apiFetch(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: newComment }),
      });
      if (res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment submission failed:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await apiFetch(`/tickets/${ticketId}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setComments(comments.filter((c) => c._id !== commentId));
      }
    } catch (err) {
      console.error('Comment deletion failed:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAttachment(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiFetch(`/tickets/${ticketId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      if (res.success) {
        setTicket(res.data);
        onTicketUpdated();
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (window.confirm('Delete this issue? This will remove all telemetry logs and attachments.')) {
      try {
        const res = await apiFetch(`/tickets/${ticketId}`, {
          method: 'DELETE',
        });
        if (res.success) {
          onTicketDeleted();
          onClose();
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const isSlaBreached = ticket?.slaDeadline && new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'Done';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-700">
              {ticket?.projectId?.key || 'ISSUE'}-{ticket?._id?.slice(-4).toUpperCase()}
            </span>
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              {ticket?.type || 'Bug'}
            </span>
            {isSlaBreached && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center space-x-1 animate-pulse">
                <ShieldAlert className="w-3 h-3" />
                <span>SLA BREACHED</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDeleteTicket}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Delete Issue"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Issue Overview & AI Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2.5 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Activity Logs ({ticket?.activityLogs?.length || 0})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' ? (
              <>
                {/* Title */}
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{ticket?.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reported {new Date(ticket?.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span>By <strong className="text-slate-700 dark:text-slate-200">{ticket?.reporter?.name}</strong></span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-300 font-medium">
                      <Target className="w-3.5 h-3.5" />
                      <span>{ticket?.storyPoints || 3} Story Points</span>
                    </span>
                  </div>
                </div>

                {/* AI Diagnostics Card */}
                <div className="bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                        AI Root Cause & Resolution Diagnostics
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                        {ticket?.aiDiagnostics?.confidenceScore || 90}% Confidence
                      </span>
                      <button
                        onClick={handleRunAIAnalysis}
                        disabled={analyzingAI}
                        className="text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition p-1"
                        title="Re-run AI Diagnostics"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${analyzingAI ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                        Identified Root Cause:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {ticket?.aiDiagnostics?.rootCause || 'Analyzing codebase patterns and error trace...'}
                      </p>
                    </div>

                    <div>
                      <span className="text-cyan-700 dark:text-cyan-400 font-semibold block text-[11px] uppercase tracking-wider flex items-center space-x-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Recommended Architectural Fix:</span>
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                        {ticket?.aiDiagnostics?.suggestedFix || 'Suggesting mitigation strategies...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-colors duration-200">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Issue Description & Reproduction Steps
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                    {ticket?.description || <span className="italic text-slate-400 dark:text-slate-500">No description provided.</span>}
                  </p>
                </div>

                {/* Attachments Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attachments ({ticket?.attachments?.length || 0})</span>
                    </h3>
                    <label className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium">
                      {uploadingAttachment ? 'Uploading...' : '+ Upload File'}
                      <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploadingAttachment} />
                    </label>
                  </div>

                  {ticket?.attachments && ticket.attachments.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {ticket.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 transition group"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{att.fileName}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 dark:text-slate-500 italic p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center">
                      No screenshots or crash dumps attached.
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5 mb-4">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Threaded Collaboration ({comments.length})</span>
                  </h3>

                  <div className="space-y-3 mb-4">
                    {comments.map((c) => (
                      <div key={c._id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center space-x-2">
                            <img
                              src={c.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.user?.name}`}
                              alt={c.user?.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.user?.name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {(user?._id === c.user?._id || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition text-[11px]"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Post a comment or technical update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="submit"
                      disabled={commentSubmitting || !newComment.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Audit Trail Tab */
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Complete Lifecycle & Transition History
                </h3>
                {ticket?.activityLogs && ticket.activityLogs.length > 0 ? (
                  <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-2">
                    {ticket.activityLogs.map((log, index) => (
                      <div key={index} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-900" />
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.action}</span>
                            <span className="text-slate-400 dark:text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 dark:text-slate-500 italic p-6 text-center">No audit logs recorded yet.</div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Metadata */}
          <div className="space-y-5 bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 h-fit transition-colors duration-200">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
              Sprint Attributes
            </h4>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={ticket?.status || 'To Do'}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={ticket?.priority || 'medium'}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 capitalize focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>

            {/* SLA Deadline Tracker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                SLA Target Deadline
              </label>
              <div className={`text-xs p-2.5 rounded-xl border ${
                isSlaBreached
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}>
                <div className="flex items-center space-x-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(ticket?.slaDeadline).toLocaleDateString()} at {new Date(ticket?.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {isSlaBreached ? '⚠️ Resolution SLA has lapsed' : 'Target within normal parameters'}
                </div>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={ticket?.assignee?._id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">Unassigned</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Reporter
              </label>
              <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <img
                  src={ticket?.reporter?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${ticket?.reporter?.name}`}
                  alt={ticket?.reporter?.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="truncate">{ticket?.reporter?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
