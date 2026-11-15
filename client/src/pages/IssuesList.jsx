import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Bot,
  Clock,
  ShieldAlert,
  Download
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { useProjects } from '../context/ProjectContext';

const IssuesList = ({ onSelectTicket, onOpenNewTicket }) => {
  const { currentProject, usersList } = useProjects();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');

  const fetchTickets = async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      let query = `?projectId=${currentProject._id}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;
      if (priorityFilter !== 'all') query += `&priority=${priorityFilter}`;
      if (typeFilter !== 'all') query += `&type=${typeFilter}`;
      if (assigneeFilter !== 'all') query += `&assignee=${assigneeFilter}`;
      if (slaFilter === 'breached') query += `&slaBreached=true`;

      const res = await apiFetch(`/tickets${query}`);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load tickets list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentProject, search, statusFilter, priorityFilter, typeFilter, assigneeFilter, slaFilter]);

  const exportToCSV = () => {
    if (tickets.length === 0) return;
    const headers = ['Key', 'Title', 'Type', 'Priority', 'Status', 'StoryPoints', 'Assignee', 'Reporter', 'Created'];
    const rows = tickets.map(t => [
      `"${t.projectId?.key}-${t._id.slice(-4).toUpperCase()}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.type}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.storyPoints || 0}"`,
      `"${t.assignee?.name || 'Unassigned'}"`,
      `"${t.reporter?.name || ''}"`,
      `"${new Date(t.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bugtracer_${currentProject.key}_issues.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-500/20 font-bold uppercase">Critical</span>;
      case 'high':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-500/20 font-semibold uppercase">High</span>;
      case 'medium':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 font-medium">Medium</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 font-medium">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Done':
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">Done</span>;
      case 'In Progress':
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20">In Progress</span>;
      default:
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">To Do</span>;
    }
  };

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Project Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please select a project to view its issue list.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">BugTracer Issue Registry</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Enterprise database registry for <strong>{currentProject.title}</strong> with CSV export & SLA filtering.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewTicket}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1 shadow-md shadow-indigo-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-sm transition-colors duration-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search keywords, stack traces, or titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Status: All</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Priority: All</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={slaFilter}
          onChange={(e) => setSlaFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">SLA: All</option>
          <option value="breached">⚠️ Breached Deadlines Only</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 capitalize focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Type: All</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature</option>
          <option value="task">Task</option>
          <option value="improvement">Improvement</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="all">Assignee: All</option>
          <option value="unassigned">Unassigned</option>
          {usersList.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Key</th>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">AI Insights</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">SLA Target</th>
                <th className="px-6 py-3.5">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const isSlaBreached = ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'Done';

                  return (
                    <tr
                      key={ticket._id}
                      onClick={() => onSelectTicket(ticket._id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition group"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {ticket.projectId?.key}-{ticket._id.slice(-4).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                          {ticket.title}
                        </div>
                        <div className="text-[11px] text-slate-500 capitalize flex items-center space-x-2 mt-0.5">
                          <span>{ticket.type}</span>
                          <span>•</span>
                          <span>{ticket.storyPoints || 3} SP</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ticket.aiDiagnostics?.confidenceScore > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 font-mono text-[10px]">
                            <Bot className="w-3 h-3" />
                            <span>{ticket.aiDiagnostics.complexity} ({ticket.aiDiagnostics.confidenceScore}%)</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Unanalyzed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isSlaBreached ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-1 text-[11px]">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Overdue</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(ticket.slaDeadline).toLocaleDateString()}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.assignee ? (
                          <div className="flex items-center space-x-2">
                            <img
                              src={ticket.assignee.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${ticket.assignee.name}`}
                              alt={ticket.assignee.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-slate-700 dark:text-slate-300">{ticket.assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400 dark:text-slate-500">
                    No matching issues found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssuesList;
