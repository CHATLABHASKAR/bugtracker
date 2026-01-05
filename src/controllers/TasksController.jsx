import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';
import { useTheme, componentStyles } from '../theme/theme';

const TasksController = () => {
  const { user, users } = useAuth();
  const { tasks, projects, addTask, updateTask, deleteTask } = useData();
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    startDate: '',
    endDate: '',
    projectId: '',
    assignedTo: user?.id || '',
  });

  // Debug: Log tasks and user info
  useEffect(() => {
    console.log('[TasksController] Tasks:', tasks.length, tasks);
    console.log('[TasksController] User:', user);
  }, [tasks, user]);

  const myTasks = tasks.filter((t) => {
    const matches = String(t.assignedTo) === String(user?.id);
    return matches;
  });

  // For now, show all tasks if user is Admin or Manager, otherwise show assigned tasks
  const displayedTasks = (user?.role === 'Admin' || user?.role === 'Manager') ? tasks : myTasks;

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      projectId: task.projectId,
      assignedTo: task.assignedTo,
    });
    setShowForm(true);
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        ...formData,
        projectId: Number(formData.projectId),
        assignedTo: Number(formData.assignedTo),
      });
    } else {
      addTask({
        ...formData,
        projectId: Number(formData.projectId),
        assignedTo: Number(formData.assignedTo),
      });
    }
    handleCancelForm();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      startDate: '',
      endDate: '',
      projectId: '',
      assignedTo: user?.id || 1,
    });
  };

  const getProjectTitle = (projectId) => {
    if (!projectId) return 'Unknown Project';
    const project = projects.find((p) => String(p.id) === String(projectId));
    return project ? project.title : 'Unknown Project';
  };

  const getAssigneeName = (id) => {
    if (!id) return 'Unassigned';
    const assignee = users.find((u) => String(u.id) === String(id));
    return assignee ? assignee.name : 'Unassigned';
  };

  const formFields = [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'E.g. Implement user authentication',
      required: true,
      colSpan: 2,
    },
    {
      name: 'projectId',
      type: 'select',
      label: 'Project',
      placeholder: true,
      options: projects.map((p) => ({ value: p.id, label: p.title })),
      required: true,
      colSpan: 1,
    },
    {
      name: 'priority',
      type: 'select',
      label: 'Priority',
      options: ['Low', 'Medium', 'High'],
      colSpan: 1,
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      colSpan: 1,
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      colSpan: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Task details...',
      rows: 3,
      colSpan: 2,
    },
  ];

  const tableColumns = [
    {
      key: 'title',
      label: 'Task Title',
      render: (row) => (
        <span className="font-semibold text-slate-800 group-hover:text-blue-700">{row.title}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => {
        const priorityColors = {
          High: 'bg-rose-50 text-rose-600 border-rose-100',
          Medium: 'bg-amber-50 text-amber-600 border-amber-100',
          Low: 'bg-blue-50 text-blue-600 border-blue-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${priorityColors[row.priority] || priorityColors.Low
              }`}
          >
            {row.priority}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${row.status === 'Completed'
              ? 'bg-emerald-500'
              : row.status === 'Pending'
                ? 'bg-rose-500'
                : 'bg-blue-500'
              }`}
          ></span>
          <span className="text-slate-600 font-medium">{row.status}</span>
        </div>
      ),
    },
    {
      key: 'projectId',
      label: 'Project',
      render: (row) => <span className="text-slate-600">{getProjectTitle(row.projectId)}</span>,
    },
    {
      key: 'endDate',
      label: 'Due Date',
      render: (row) => <span className="text-slate-500 text-xs font-medium">{row.endDate}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <span className="material-icons text-lg">visibility</span>
          </button>
          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTask(row);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <span className="material-icons text-lg">edit</span>
            </button>
          )}
          {user?.role === 'Admin' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Delete task?')) deleteTask(row.id);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="material-icons text-lg">delete</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div
      className={`flex flex-col h-full ${theme.containerBgSolid} ${theme.shadow} rounded-lg overflow-hidden ${theme.borderColor} border`}
    >
      {/* Page Header & Filters */}
      <div className={`${theme.containerBgSolid} border-b ${theme.borderColor} p-4`}>
        <div className="flex justify-between items-center mb-4">
          <div className={`flex items-center gap-2 ${theme.textPrimary}`}>
            <div className={`p-1.5 ${theme.accentBg} rounded-lg ${theme.textPrimary}`}>
              <span className="material-icons text-xl">task_alt</span>
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme.textPrimary}`}>My Tasks</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                import('../utils/exportUtils').then((module) =>
                  module.exportToExcel(myTasks, 'My_Tasks'),
                )
              }
              className={`${theme.successBg} ${theme.successText} p-2 rounded ${theme.shadow} transition-colors flex items-center gap-2`}
              title="Export to Excel"
            >
              <span className="material-icons text-sm">file_download</span>
              <span className="hidden md:inline">Export</span>
            </button>
            {user?.role !== 'Observer' && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setFormData({
                    title: '',
                    description: '',
                    priority: 'Medium',
                    status: 'Pending',
                    startDate: '',
                    endDate: '',
                    projectId: '',
                    assignedTo: user?.id || 1,
                  });
                  setShowForm(true);
                }}
                className={`${componentStyles.button.primary(theme)} flex items-center gap-2`}
              >
                <span className="material-icons text-sm">add</span>
                <span className="hidden md:inline">New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`flex flex-col md:flex-row md:items-center gap-3 ${theme.backgroundTertiary} p-3 rounded-md ${theme.borderColor} border`}
        >
          {/* Search & Mobile Toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-auto">
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full md:w-64 pl-9 pr-4 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
              />
              <span className="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden p-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-600 transition-colors ${showFilters ? 'bg-slate-100 ring-2 ring-blue-100' : ''
                }`}
            >
              <span className="material-icons">filter_list</span>
            </button>
          </div>

          {/* Collapsible Filters */}
          <div
            className={`${showFilters ? 'flex' : 'hidden'
              } md:flex flex-col md:flex-row gap-3 w-full md:w-auto md:items-center animate-fade-in-down md:animate-none`}
          >
            <div className="relative group">
              <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-hover:text-blue-500 transition-colors">
                filter_list
              </span>
              <select className="w-full md:w-auto pl-9 pr-8 py-2 text-sm border border-slate-300 rounded bg-white text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all hover:border-slate-400">
                <option>All Priorities</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="relative group">
              <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-hover:text-blue-500 transition-colors">
                tune
              </span>
              <select className="w-full md:w-auto pl-9 pr-8 py-2 text-sm border border-slate-300 rounded bg-white text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all hover:border-slate-400">
                <option>All Statuses</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="h-8 w-px bg-slate-300 mx-1 hidden md:block"></div>

            {/* Date Range */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex items-center bg-white border border-slate-300 rounded px-3 py-1.5 shadow-sm hover:border-slate-400 transition-colors">
                <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wide">
                  From
                </span>
                <input
                  type="date"
                  className="text-sm text-slate-600 focus:outline-none font-medium w-full md:w-auto"
                />
              </div>
              <div className="flex items-center bg-white border border-slate-300 rounded px-3 py-1.5 shadow-sm hover:border-slate-400 transition-colors">
                <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wide">
                  To
                </span>
                <input
                  type="date"
                  className="text-sm text-slate-600 focus:outline-none font-medium w-full md:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${theme.containerBgSolid} flex overflow-hidden relative`}>
        <div
          className={`flex-1 transition-all duration-300 transform ${selectedTask ? 'lg:w-2/3 border-r border-slate-200' : 'w-full'
            }`}
        >
          <DynamicTable
            data={displayedTasks}
            columns={tableColumns}
            onRowClick={setSelectedTask}
            selectedRow={selectedTask}
            emptyMessage="No tasks found"
            emptySubMessage="Create a new task to get started."
            emptyIcon="task_alt"
          />
        </div>

        {selectedTask && (
          <div
            className={`fixed inset-0 z-50 w-full h-full bg-white lg:static lg:w-1/3 lg:h-full flex flex-col animate-fade-in-right overflow-y-auto border-l ${theme.borderColor} ${theme.shadowStrong}`}
          >
            <div
              className={`p-5 ${theme.containerBgSolid} border-b ${theme.borderColor} flex justify-between items-center sticky top-0 z-10`}
            >
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="lg:hidden p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <span className="material-icons">arrow_back</span>
                </button>
                <h3
                  className={`font-bold ${theme.textPrimary} text-lg flex items-center gap-2`}
                >
                  <span className={`material-icons ${theme.primaryColor}`}>info</span>
                  Task Details #{selectedTask.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete task?')) {
                        deleteTask(selectedTask.id);
                        setSelectedTask(null);
                      }
                    }}
                    className={`${theme.textMuted} hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all mr-1`}
                    title="Delete Task"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  className={`${theme.textMuted} hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all`}
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                >
                  Title
                </label>
                <p
                  className={`${theme.textPrimary} font-bold text-xl mt-1 leading-snug`}
                >
                  {selectedTask.title}
                </p>
              </div>

              <div
                className={`grid grid-cols-2 gap-6 p-4 ${theme.backgroundTertiary} rounded-lg ${theme.borderColor} border`}
              >
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Status
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                    className={componentStyles.input(theme)}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Priority
                  </label>
                  <div
                    className={`mt-1 inline-flex items-center ${componentStyles.badge[
                      selectedTask.priority === 'High'
                        ? 'error'
                        : selectedTask.priority === 'Medium'
                          ? 'warning'
                          : 'primary'
                    ](theme)
                      }`}
                  >
                    {selectedTask.priority}
                  </div>
                </div>
              </div>

              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                >
                  Description
                </label>
                <div
                  className={`mt-2 p-4 ${theme.backgroundTertiary} ${theme.borderColor} border rounded-lg text-sm ${theme.textSecondary} leading-relaxed font-medium`}
                >
                  {selectedTask.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Project
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary}`}
                  >
                    {getProjectTitle(selectedTask.projectId)}
                  </p>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Assigned To
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary}`}
                  >
                    {getAssigneeName(selectedTask.assignedTo)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <DynamicForm
          fields={formFields}
          formData={formData}
          onChange={handleFieldChange}
          onSubmit={handleSubmitTask}
          onCancel={handleCancelForm}
          title={editingTask ? 'Edit Task' : 'Create New Task'}
          submitLabel={editingTask ? 'Update Task' : 'Create Task'}
          icon={editingTask ? 'edit' : 'post_add'}
          iconColor="indigo"
          gridCols={2}
        />
      )}
    </div>
  );
};

export default TasksController;