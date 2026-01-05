import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/theme';
import api from '../services/api';
import DashboardView from '../views/DashboardView';

// Controller layer: handles data fetching and passes data into the view
const DashboardController = () => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();

  const [stats, setStats] = useState(null);
  const [teamWorkload, setTeamWorkload] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardStats, workload, allProjects, allTasks, allBugs] = await Promise.all([
          api.getDashboardStats(), // Keep for Admin, or as base
          api.getTeamWorkload(),
          api.getProjects(),
          api.getTasks(),
          api.getBugs(),
        ]);

        let filteredProjects = allProjects;
        let filteredTasks = allTasks;
        let filteredBugs = allBugs;
        let filteredWorkload = workload;
        let calculatedStats = dashboardStats;

        // Role-based filtering
        if (user) {
          if (user.role === 'Manager') {
            // Managers see projects they manage, and tasks/bugs within those
            filteredProjects = allProjects.filter(p => p.managerId === user.id || p.managerId === user._id);
            const projectIds = filteredProjects.map(p => p.id);
            filteredTasks = allTasks.filter(t => projectIds.includes(t.projectId));
            filteredBugs = allBugs.filter(b => {
              // Find bug's task to check project
              const task = allTasks.find(t => String(t.id) === String(b.taskId));
              return task && projectIds.includes(task.projectId);
            });
            // Workload: Show only devs on their projects? Or all? Let's keep all for now for Managers.
          } else if (user.role === 'Developer') {
            // Developers see assigned projects and tasks, and assigned bugs
            filteredProjects = allProjects.filter(p => p.assignedDevelopers && p.assignedDevelopers.some(d => (d.id === user.id || d._id === user.id) || d === user.id));
            filteredTasks = allTasks.filter(t => t.assignedTo === user.id || t.assignedTo === user._id || (t.assignedToUser && (t.assignedToUser.id === user.id || t.assignedToUser._id === user.id)));
            filteredBugs = allBugs.filter(b => b.assignedTo === user.id || b.assignedTo === user._id || (typeof b.assignedTo === 'object' && (b.assignedTo.id === user.id || b.assignedTo._id === user.id)));
            filteredWorkload = []; // Hide workload for devs
          } else if (user.role === 'Tester') {
            // Testers see bugs reported by them or assigned to them
            filteredTasks = allTasks.filter(t => t.assignedTo === user.id || t.assignedTo === user._id); // Rare but possible
            filteredBugs = allBugs.filter(b => b.reportedBy === user.id || b.reportedBy === user._id || b.assignedTo === user.id || b.assignedTo === user._id);
            filteredWorkload = []; // Hide workload
          }
          // Admin sees everything (filtered remains 'all')
        }

        // Recalculate stats for non-Admins (or everyone to be safe/consistent)
        if (user?.role !== 'Admin') {
          calculatedStats = {
            totalWork: filteredTasks.length + filteredBugs.length,
            completedWork: filteredTasks.filter(t => t.status === 'Completed').length + filteredBugs.filter(b => b.status === 'Resolved').length,
            inProgressWork: filteredTasks.filter(t => t.status === 'In Progress').length + filteredBugs.filter(b => b.status === 'In Progress').length,
            pendingWork: filteredTasks.filter(t => t.status === 'Pending').length + filteredBugs.filter(b => b.status === 'Open').length,
            completionPercentage: 0, // calc below
            taskStats: {
              total: filteredTasks.length,
              completed: filteredTasks.filter(t => t.status === 'Completed').length,
              inProgress: filteredTasks.filter(t => t.status === 'In Progress').length,
              pending: filteredTasks.filter(t => t.status === 'Pending').length,
            },
            bugStats: {
              total: filteredBugs.length,
              resolved: filteredBugs.filter(b => b.status === 'Resolved').length,
              inProgress: filteredBugs.filter(b => b.status === 'In Progress').length,
              open: filteredBugs.filter(b => b.status === 'Open').length,
            },
            projectStats: {
              total: filteredProjects.length,
              active: filteredProjects.filter(p => p.status === 'Active').length,
              inProgress: filteredProjects.filter(p => p.status === 'In Progress').length,
              completed: filteredProjects.filter(p => p.status === 'Completed').length,
            }
          };
          if (calculatedStats.totalWork > 0) {
            calculatedStats.completionPercentage = Math.round((calculatedStats.completedWork / calculatedStats.totalWork) * 100);
          }
        }

        setStats(calculatedStats);
        setTeamWorkload(filteredWorkload);
        setRecentActivity([...filteredTasks, ...filteredBugs].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <DashboardView
      user={user}
      theme={theme}
      isDarkMode={isDarkMode}
      stats={stats}
      teamWorkload={teamWorkload}
      recentActivity={recentActivity}
      isLoading={isLoading}
    />
  );
};

export default DashboardController;


