import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [modules, setModules] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [bugs, setBugs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data from API when user is authenticated
    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                setProjects([]);
                setModules([]);
                setTasks([]);
                setBugs([]);
                setIsLoaded(true);
                return;
            }

            try {
                // Fetch all data from API
                const [loadedProjects, loadedTasks, loadedBugs] = await Promise.all([
                    api.getProjects(),
                    api.getTasks(),
                    api.getBugs()
                ]);

                setProjects(loadedProjects || []);
                setTasks(loadedTasks || []);
                setBugs(loadedBugs || []);

                // Debug logging
                console.log('DataContext: Loaded data', {
                    projects: loadedProjects?.length || 0,
                    tasks: loadedTasks?.length || 0,
                    bugs: loadedBugs?.length || 0,
                    projectTitles: loadedProjects?.map(p => p.title) || [],
                    firstTask: loadedTasks?.[0],
                    firstBug: loadedBugs?.[0]
                });

                // Load modules for all projects from API
                let allModules = [];
                if (loadedProjects.length > 0) {
                    for (const project of loadedProjects) {
                        try {
                            const projectModules = await api.getModules(project.id);
                            if (Array.isArray(projectModules)) {
                                allModules.push(...projectModules);
                            }
                        } catch (err) {
                            // Skip individual project errors silently
                            console.warn(`Failed to load modules for project ${project.id}:`, err.message);
                        }
                    }
                }
                setModules(allModules);

                // Load notifications from local storage
                const storedNotifications = JSON.parse(localStorage.getItem('tracker_notifications')) || [];
                setNotifications(storedNotifications);

                setIsLoaded(true);
            } catch (error) {
                console.error("Failed to load data from API:", error);
                // Set empty arrays on error
                setProjects([]);
                setTasks([]);
                setBugs([]);
                setModules([]);
                setIsLoaded(true);
            }
        };

        loadData();
    }, [user]);

    // Save notifications to localStorage (client-side preference)
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('tracker_notifications', JSON.stringify(notifications));
        }
    }, [notifications, isLoaded]);

    const addNotification = (message, type = 'info') => {
        const newNotification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
        console.log(`[Notification] ${message}`);
    };

    const addTask = async (taskData) => {
        try {
            const newTask = await api.createTask({ ...taskData, status: 'Pending' });
            setTasks(prev => [...prev, newTask]);
            addNotification(`New task assigned: ${newTask.title}`, 'success');
        } catch (error) {
            console.error("Error creating task:", error);
            addNotification("Failed to create task", 'error');
        }
    };

    const updateTask = async (taskId, updates) => {
        try {
            await api.updateTask(taskId, updates);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

            const task = tasks.find(t => t.id === taskId);
            if (updates.status) {
                addNotification(`Task "${task?.title}" status updated to ${updates.status}`);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const addProject = async (projectData) => {
        try {
            // Use status from projectData if provided, otherwise default to 'Planning'
            const projectPayload = {
                ...projectData,
                status: projectData.status || 'Planning',
            };
            const newProject = await api.createProject(projectPayload);
            setProjects(prev => [...prev, newProject]);
            addNotification(`New project created: ${newProject.title}`, 'success');
        } catch (error) {
            console.error("Error creating project:", error);
            addNotification("Failed to create project", 'error');
        }
    };

    const addModule = async (projectId, moduleData) => {
        try {
            const newModule = await api.createModule(projectId, moduleData);
            setModules(prev => [...prev, newModule]);
            addNotification(`New module created: ${newModule.name}`, 'success');
        } catch (error) {
            console.error("Error creating module:", error);
            addNotification("Failed to create module", 'error');
            throw error;
        }
    };

    const updateModule = async (projectId, moduleId, updates) => {
        try {
            await api.updateModule(projectId, moduleId, updates);
            setModules(prev => prev.map(m => (m.projectId === projectId && m.id === moduleId) ? { ...m, ...updates } : m));
            const module = modules.find(m => m.projectId === projectId && m.id === moduleId);
            addNotification(`Module "${module?.name}" updated successfully`);
        } catch (error) {
            console.error("Error updating module:", error);
            addNotification("Failed to update module", 'error');
            throw error;
        }
    };

    const deleteModule = async (projectId, moduleId) => {
        try {
            await api.deleteModule(projectId, moduleId);
            setModules(prev => prev.filter(m => !(Number(m.projectId) === Number(projectId) && Number(m.id) === Number(moduleId))));
            addNotification(`Module deleted successfully`);
        } catch (error) {
            console.error("Error deleting module:", error);
            addNotification("Failed to delete module", 'error');
            throw error;
        }
    };

    const updateProject = async (projectId, updates) => {
        try {
            await api.updateProject(projectId, updates);
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
            const project = projects.find(p => p.id === projectId);
            addNotification(`Project "${project?.title}" updated successfully`);
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const addBug = async (bugData) => {
        try {
            // Status is already set in bugData, don't override
            const newBug = await api.createBug(bugData);
            // Normalize the bug to ensure it has all required fields
            const normalizedBug = {
                ...newBug,
                id: newBug.id || newBug._id,
                taskId: newBug.taskId, // Ensure taskId is preserved
            };
            console.log('🔵 Adding bug to state:', normalizedBug);
            setBugs(prev => {
                const updated = [...prev, normalizedBug];
                console.log('🔵 Bugs state updated, total bugs:', updated.length);
                return updated;
            });
            addNotification(`New bug reported: ${normalizedBug.title}`, 'error');
            return normalizedBug; // Return the created bug
        } catch (error) {
            console.error("Error reporting bug:", error);
            addNotification("Failed to report bug", 'error');
            throw error; // Re-throw so caller can handle it
        }
    };

    const updateBug = async (bugId, updates) => {
        try {
            const updatedBug = await api.updateBug(bugId, updates);
            // Normalize the bug to ensure it has all required fields
            const normalizedBug = {
                ...updatedBug,
                id: updatedBug.id || updatedBug._id || bugId,
            };
            setBugs(prev => prev.map(b => String(b.id) === String(bugId) ? normalizedBug : b));
            const bug = bugs.find(b => String(b.id) === String(bugId));
            if (updates.status) {
                addNotification(`Bug "${bug?.title}" status updated to ${updates.status}`);
            }
        } catch (error) {
            console.error("Error updating bug:", error);
            throw error; // Re-throw so caller can handle it
        }
    };

    const deleteProject = async (projectId) => {
        try {
            await api.deleteProject(projectId);
            // Refresh data to ensure sync
            const updatedProjects = await api.getProjects();
            setProjects(updatedProjects);
            addNotification(`Project deleted successfully`);
        } catch (error) {
            console.error("Error deleting project:", error);
            addNotification("Failed to delete project", 'error');
        }
    };

    const deleteTask = async (taskId) => {
        try {
            await api.deleteTask(taskId);
            // Refresh data to ensure sync
            const updatedTasks = await api.getTasks();
            setTasks(updatedTasks);
            addNotification(`Task deleted successfully`);
        } catch (error) {
            console.error("Error deleting task:", error);
            addNotification("Failed to delete task", 'error');
        }
    };

    const deleteBug = async (bugId) => {
        try {
            await api.deleteBug(bugId);
            // Refresh data to ensure sync
            const updatedBugs = await api.getBugs();
            setBugs(updatedBugs);
            addNotification(`Bug report deleted successfully`);
        } catch (error) {
            console.error("Error deleting bug:", error);
            addNotification("Failed to delete bug", 'error');
        }
    };

    const markNotificationRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <DataContext.Provider value={{
            projects,
            modules,
            tasks,
            bugs,
            notifications,
            addTask,
            updateTask,
            addProject,
            updateProject,
            addModule,
            updateModule,
            deleteModule,
            addBug,
            updateBug,
            deleteProject,
            deleteTask,
            deleteBug,
            markNotificationRead
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
