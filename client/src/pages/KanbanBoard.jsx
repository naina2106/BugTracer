import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  Search, 
  Paperclip, 
  Sparkles,
  Bot,
  ShieldAlert,
  Clock,
  Layers,
  Target
} from 'lucide-react';
import { apiFetch } from '../services/api';
import { useProjects } from '../context/ProjectContext';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

const KanbanBoard = ({ onSelectTicket, onOpenNewTicket }) => {
  const { currentProject, usersList } = useProjects();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');

  const fetchTickets = async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      let query = `?projectId=${currentProject._id}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (priorityFilter !== 'all') query += `&priority=${priorityFilter}`;
      if (assigneeFilter !== 'all') query += `&assignee=${assigneeFilter}`;
      if (slaFilter === 'breached') query += `&slaBreached=true`;

      const res = await apiFetch(`/tickets${query}`);
      if (res.success) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to load tickets for kanban:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentProject, search, priorityFilter, assigneeFilter, slaFilter]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetStatus = destination.droppableId;
    const movedTicket = tickets.find((t) => t._id === draggableId);
    if (!movedTicket) return;

    // Optimistic UI update
    const updatedTickets = tickets.map((t) =>
      t._id === draggableId ? { ...t, status: targetStatus } : t
    );
    setTickets(updatedTickets);

    try {
      await apiFetch(`/tickets/${draggableId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: targetStatus,
          order: destination.index,
        }),
      });
    } catch (err) {
      console.error('Failed to sync status:', err);
      fetchTickets();
    }
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '✨';
      case 'task': return '📋';
      case 'improvement': return '⚡';
      default: return '📌';
    }
  };

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Project Selected</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Please select or create a project workspace to access the Kanban board.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{currentProject.title}</span>
            <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/20">
              {currentProject.key}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Active Agile Kanban sprint board with real-time AI root cause diagnostics & SLA monitors.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sprint cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-52 transition"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
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
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">SLA: All</option>
            <option value="breached">⚠️ Breached SLA</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="all">Assignee: All</option>
            <option value="unassigned">Unassigned</option>
            {usersList.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenNewTicket}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center space-x-1 shadow-md shadow-indigo-600/25 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map((columnId) => {
            const columnTickets = tickets.filter((t) => t.status === columnId);

            return (
              <div
                key={columnId}
                className="bg-slate-100/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-4 flex flex-col min-h-[520px] transition-colors duration-200"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        columnId === 'To Do'
                          ? 'bg-slate-400 dark:bg-slate-500'
                          : columnId === 'In Progress'
                          ? 'bg-amber-500 dark:bg-amber-400 animate-pulse'
                          : 'bg-emerald-500 dark:bg-emerald-400'
                      }`}
                    />
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{columnId}</h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-sm">
                    {columnTickets.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 transition rounded-2xl ${
                        snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {columnTickets.map((ticket, index) => {
                        const isSlaBreached = ticket.slaDeadline && new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'Done';

                        return (
                          <Draggable
                            key={ticket._id}
                            draggableId={ticket._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => onSelectTicket(ticket._id)}
                                className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-pointer shadow-sm dark:shadow-md transition-all ${
                                  snapshot.isDragging
                                    ? 'border-indigo-500 shadow-2xl scale-[1.02] rotate-1 z-50'
                                    : isSlaBreached
                                    ? 'border-rose-400 dark:border-rose-500/40 hover:border-rose-500'
                                    : 'border-slate-200 dark:border-slate-800 hover:shadow-indigo-500/10'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                      {ticket.projectId?.key || 'ISSUE'}-{ticket._id.slice(-4).toUpperCase()}
                                    </span>
                                    {ticket.aiDiagnostics?.confidenceScore > 0 && (
                                      <span className="p-0.5 px-1 rounded bg-indigo-50 dark:bg-indigo-500/15 text-[10px] text-indigo-600 dark:text-indigo-300 flex items-center space-x-0.5" title="AI Diagnosed">
                                        <Bot className="w-2.5 h-2.5" />
                                        <span>AI</span>
                                      </span>
                                    )}
                                  </div>
                                  {getPriorityBadge(ticket.priority)}
                                </div>

                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                                  {ticket.title}
                                </p>

                                {/* SLA or Story Points Info */}
                                <div className="flex items-center justify-between mt-2.5 text-[10px]">
                                  {isSlaBreached ? (
                                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-1">
                                      <ShieldAlert className="w-3 h-3" />
                                      <span>SLA Overdue</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>Due {new Date(ticket.slaDeadline).toLocaleDateString()}</span>
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium">
                                    {ticket.storyPoints || 3} SP
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center space-x-2">
                                    <span>{getTypeIcon(ticket.type)}</span>
                                    {ticket.attachments?.length > 0 && (
                                      <span className="flex items-center space-x-0.5 text-slate-500 dark:text-slate-400">
                                        <Paperclip className="w-3 h-3" />
                                        <span>{ticket.attachments.length}</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-1.5">
                                    {ticket.assignee ? (
                                      <img
                                        src={ticket.assignee.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${ticket.assignee.name}`}
                                        alt={ticket.assignee.name}
                                        title={`Assigned to ${ticket.assignee.name}`}
                                        className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">Unassigned</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
