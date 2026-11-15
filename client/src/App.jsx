import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import IssuesList from './pages/IssuesList';
import ProjectsView from './pages/ProjectsView';
import CreateTicketModal from './components/CreateTicketModal';
import CreateProjectModal from './components/CreateProjectModal';
import TicketDetailModal from './components/TicketDetailModal';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
        <Navbar
          onOpenNewTicket={() => setIsTicketModalOpen(true)}
          onOpenNewProject={() => setIsProjectModalOpen(true)}
        />

        <main className="flex-1">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  key={refreshTrigger}
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                />
              }
            />
            <Route
              path="/kanban"
              element={
                <KanbanBoard
                  key={refreshTrigger}
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                  onOpenNewTicket={() => setIsTicketModalOpen(true)}
                />
              }
            />
            <Route
              path="/issues"
              element={
                <IssuesList
                  key={refreshTrigger}
                  onSelectTicket={(id) => setSelectedTicketId(id)}
                  onOpenNewTicket={() => setIsTicketModalOpen(true)}
                />
              }
            />
            <Route
              path="/projects"
              element={
                <ProjectsView
                  onOpenNewProject={() => setIsProjectModalOpen(true)}
                />
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <CreateTicketModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          onTicketCreated={() => setRefreshTrigger((prev) => prev + 1)}
        />

        <CreateProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
        />

        <TicketDetailModal
          ticketId={selectedTicketId}
          isOpen={!!selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onTicketUpdated={() => setRefreshTrigger((prev) => prev + 1)}
          onTicketDeleted={() => {
            setSelectedTicketId(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </div>
    </ProjectProvider>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
