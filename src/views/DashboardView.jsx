import React from 'react';
import { componentStyles } from '../theme/theme';

// View layer: purely presentational Dashboard UI
const DashboardView = ({
  user,
  theme,
  isDarkMode,
  stats,
  teamWorkload,
  recentActivity,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? theme.background : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const {
    totalWork = 0,
    completedWork = 0,
    inProgressWork = 0,
    pendingWork = 0,
    completionPercentage = 0,
    taskStats = { total: 0, completed: 0, inProgress: 0, pending: 0 },
    bugStats = { total: 0, resolved: 0, inProgress: 0, open: 0 },
    projectStats = { total: 0, active: 0, inProgress: 0, completed: 0 },
  } = stats || {};

  const tasks = recentActivity.filter((i) => !i.severity).slice(0, 3);
  const bugs = recentActivity.filter((i) => i.severity).slice(0, 2);

  return (
    <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} h-full overflow-y-auto`}>
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${theme.textPrimary} tracking-tight`}>
          {user?.role === 'Admin' ? 'System Dashboard' : 'My Dashboard'}
        </h1>
        <p className={`${theme.textMuted} mt-1`}>
          {user?.role === 'Admin'
            ? 'Comprehensive overview of all work and project activities.'
            : `Overview of your ${user?.role === 'Manager' ? 'managed projects and team' : 'assigned work and activities'}.`}
        </p>
      </div>

      {/* Total Work Overview */}
      <div className="relative overflow-hidden rounded-3xl p-8 mb-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
              <p className="text-indigo-100 mt-1 font-medium">Combined workload statistics</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
              <span className="material-icons text-4xl">analytics</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="text-4xl font-bold mb-1">{totalWork}</div>
              <div className="text-sm text-indigo-100 font-medium">Total Items</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="text-4xl font-bold text-emerald-300 mb-1">{completedWork}</div>
              <div className="text-sm text-indigo-100 font-medium">Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="text-4xl font-bold text-blue-300 mb-1">{inProgressWork}</div>
              <div className="text-sm text-indigo-100 font-medium">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="text-4xl font-bold text-amber-300 mb-1">{pendingWork}</div>
              <div className="text-sm text-indigo-100 font-medium">Pending</div>
            </div>
          </div>

          <div className="mt-8 bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/5">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium text-indigo-100">Overall Completion</span>
              <span className="font-bold text-white">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-3 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Task Statistics */}
        <div className={`${componentStyles.card(theme)} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <span className="material-icons text-blue-500 text-3xl">assignment</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Tasks</h3>
                <p className={`text-sm ${theme.textMuted} font-medium`}>{taskStats.total} Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>Completed</span>
              <span className={`text-sm font-bold ${theme.successText}`}>{taskStats.completed}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>In Progress</span>
              <span className={`text-sm font-bold ${theme.infoText}`}>{taskStats.inProgress}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>Pending</span>
              <span className={`text-sm font-bold ${theme.textMuted}`}>{taskStats.pending}</span>
            </div>
          </div>
        </div>

        {/* Bug Statistics */}
        <div className={`${componentStyles.card(theme)} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <span className="material-icons text-rose-500 text-3xl">bug_report</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Bugs</h3>
                <p className={`text-sm ${theme.textMuted} font-medium`}>{bugStats.total} Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>Resolved</span>
              <span className={`text-sm font-bold ${theme.successText}`}>{bugStats.resolved}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>In Progress</span>
              <span className={`text-sm font-bold ${theme.warningText}`}>{bugStats.inProgress}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>Open</span>
              <span className={`text-sm font-bold ${theme.errorText}`}>{bugStats.open}</span>
            </div>
          </div>
        </div>

        {/* Project Statistics */}
        <div className={`${componentStyles.card(theme)} p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 rounded-2xl">
                <span className="material-icons text-violet-500 text-3xl">folder</span>
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme.textPrimary}`}>Projects</h3>
                <p className={`text-sm ${theme.textMuted} font-medium`}>{projectStats.total} Total</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>Active</span>
              <span className={`text-sm font-bold ${theme.successText}`}>{projectStats.active}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>In Progress</span>
              <span className={`text-sm font-bold ${theme.infoText}`}>{projectStats.inProgress}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg">
              <span className={`text-sm font-medium ${theme.textSecondary}`}>Completed</span>
              <span className={`text-sm font-bold ${theme.textMuted}`}>{projectStats.completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Team workload & recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <div className={`${componentStyles.card(theme)} overflow-hidden`}>
            <div className={`p-6 border-b ${theme.borderColorLight}`}>
              <div className="flex items-center gap-3">
                <span className={`material-icons ${theme.primaryColor}`}>groups</span>
                <div>
                  <h2 className={`text-lg font-bold ${theme.textPrimary}`}>Team Workload</h2>
                  <p className={`text-sm ${theme.textSecondary}`}>Daily distribution</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5 max-h-96 overflow-y-auto">
              {teamWorkload.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`font-bold ${theme.textPrimary} text-sm truncate`}>{member.name}</span>
                      <span className={`text-xs font-bold ${theme.textMuted}`}>{member.totalWork} items</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${(member.taskCount / (member.totalWork || 1)) * 100}%` }}
                      ></div>
                      <div
                        className="bg-rose-500 h-full"
                        style={{ width: `${(member.bugCount / (member.totalWork || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`${componentStyles.card(theme)} overflow-hidden`}>
          <div className={`p-6 border-b ${theme.borderColorLight}`}>
            <div className="flex items-center gap-3">
              <span className={`material-icons ${theme.infoText}`}>history</span>
              <div>
                <h2 className={`text-lg font-bold ${theme.textPrimary}`}>Recent Activity</h2>
                <p className={`text-sm ${theme.textSecondary}`}>Latest updates</p>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {tasks.map((task) => (
              <div key={`task-${task.id}`} className="p-4 rounded-2xl mb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                    <span className="material-icons text-blue-600 dark:text-blue-400">assignment</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold ${theme.textPrimary} text-sm`}>{task.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {task.status}
                      </span>
                    </div>
                    <p className={`text-xs ${theme.textMuted} mt-1`}>
                      {user?.role === 'Developer' || user?.role === 'Tester' ? 'Assigned to you' : 'Project task'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {bugs.map((bug) => (
              <div key={`bug-${bug.id}`} className="p-4 rounded-2xl mb-2">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl">
                    <span className="material-icons text-rose-600 dark:text-rose-400">bug_report</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold ${theme.textPrimary} text-sm`}>{bug.title}</h4>
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                        {bug.status}
                      </span>
                    </div>
                    <p className={`text-xs ${theme.textMuted} mt-1`}>Bug report • {bug.severity} severity</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;


