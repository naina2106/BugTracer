import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await apiFetch('/projects');
      if (res.success) {
        setProjects(res.data);
        if (res.data.length > 0) {
          const storedProjectId = localStorage.getItem('bugtracer_selected_project');
          const found = res.data.find(p => p._id === storedProjectId);
          setCurrentProject(found || res.data[0]);
        } else {
          setCurrentProject(null);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/auth/users');
      if (res.success) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [user]);

  const selectProject = (project) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('bugtracer_selected_project', project._id);
    }
  };

  const createProject = async (projectData) => {
    const res = await apiFetch('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
    if (res.success) {
      setProjects(prev => [res.data, ...prev]);
      setCurrentProject(res.data);
      localStorage.setItem('bugtracer_selected_project', res.data._id);
      return res.data;
    }
  };

  const addMemberToProject = async (projectId, userId, role) => {
    const res = await apiFetch(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    });
    if (res.success) {
      setProjects(prev => prev.map(p => p._id === projectId ? res.data : p));
      if (currentProject?._id === projectId) {
        setCurrentProject(res.data);
      }
      return res.data;
    }
  };

  const deleteProject = async (projectId) => {
    const res = await apiFetch(`/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (res.success) {
      const remaining = projects.filter(p => p._id !== projectId);
      setProjects(remaining);
      if (currentProject?._id === projectId) {
        setCurrentProject(remaining[0] || null);
      }
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        selectProject,
        createProject,
        addMemberToProject,
        deleteProject,
        fetchProjects,
        usersList,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
