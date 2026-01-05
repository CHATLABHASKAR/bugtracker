import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';
import { useTheme, componentStyles } from '../theme/theme';
import Swal from 'sweetalert2';

const ProjectsController = () => {
  const { projects, modules, tasks, bugs, addProject, updateProject, deleteProject } = useData();
  const { user, users } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Planning',
    assignedDeveloperId: '',
  });

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      assignedDeveloperId: project.assignedDeveloperId || '',
    });
    setShowForm(true);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Project title and description are required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const submitData = {
      ...formData,
      assignedDeveloperId: formData.assignedDeveloperId ? Number(formData.assignedDeveloperId) : null,
    };

    try {
      if (editingProject) {
        await updateProject(editingProject.id, submitData);
        handleCancelForm();
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Project "${formData.title}" updated successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await addProject(submitData);
        handleCancelForm();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Project "${formData.title}" created successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: editingProject ? 'Failed to update project. Please try again.' : 'Failed to create project. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ title: '', description: '', startDate: '', endDate: '', status: 'Planning', assignedDeveloperId: '' });
  };

  const formFields = [
    {
      name: 'title',
      type: 'text',
      label: 'Project Title',
      placeholder: 'E.g. Website Redesign',
      required: true,
      colSpan: 2,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: ['Planning', 'Active', 'In Progress', 'Completed', 'On Hold'],
      colSpan: 1,
    },
    {
      name: 'assignedDeveloperId',
      type: 'select',
      label: 'Assign To Developer',
      options: users.filter(u => u.role === 'Developer').map(u => ({ value: u.id, label: u.name })),
      required: true,
      colSpan: 1,
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      required: true,
      colSpan: 1,
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      required: true,
      colSpan: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Project details...',
      rows: 3,
      required: true,
      colSpan: 2,
    },
  ];

  // Helper function to get project statistics
  const getProjectStats = (projectId) => {
    const projectModules = modules.filter(m => m.projectId === projectId);
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const projectBugs = bugs.filter(b => {
      const bugTask = projectTasks.find(t => t.id === b.taskId);
      return bugTask !== undefined;
    });
    return {
      modules: projectModules.length,
      tasks: projectTasks.length,
      bugs: projectBugs.length,
      completedTasks: projectTasks.filter(t => t.status === 'Completed').length,
      openBugs: projectBugs.filter(b => b.status === 'Open').length,
    };
  };

  const tableColumns = [
    {
      key: 'title',
      label: 'Project Title',
      render: (row) => (
        <Link to={`/projects/${row.id}`} onClick={(e) => e.stopPropagation()}>
          <span className="font-semibold text-slate-800 group-hover:text-blue-700">{row.title}</span>
        </Link>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const statusColors = {
          Active: 'bg-blue-50 text-blue-600 border-blue-100',
          'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
          Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          'On Hold': 'bg-amber-50 text-amber-600 border-amber-100',
        };
        const defaultColor = 'bg-slate-50 text-slate-600 border-slate-100';
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[row.status] || defaultColor
              }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'stats',
      label: 'Details',
      render: (row) => {
        const stats = getProjectStats(row.id);
        return (
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1" title={`${stats.modules} Modules`}>
              <span className="material-icons text-indigo-500 text-sm">view_module</span>
              <span className="text-slate-600 font-medium">{stats.modules}</span>
            </div>
            <div className="flex items-center gap-1" title={`${stats.tasks} Tasks (${stats.completedTasks} Completed)`}>
              <span className="material-icons text-blue-500 text-sm">task_alt</span>
              <span className="text-slate-600 font-medium">{stats.tasks}</span>
              {stats.completedTasks > 0 && (
                <span className="text-green-600 font-semibold">({stats.completedTasks})</span>
              )}
            </div>
            <div className="flex items-center gap-1" title={`${stats.bugs} Bugs (${stats.openBugs} Open)`}>
              <span className="material-icons text-red-500 text-sm">bug_report</span>
              <span className="text-slate-600 font-medium">{stats.bugs}</span>
              {stats.openBugs > 0 && (
                <span className="text-red-600 font-semibold">({stats.openBugs})</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (row) => <span className="text-slate-500 text-xs font-medium">{row.startDate}</span>,
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (row) => <span className="text-slate-500 text-xs font-medium">{row.endDate}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Link to={`/projects/${row.id}`} onClick={(e) => e.stopPropagation()}>
            <button className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <span className="material-icons text-lg">visibility</span>
            </button>
          </Link>
          {(user?.role === 'Manager' || user?.role === 'Admin') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditProject(row);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              <span className="material-icons text-lg">edit</span>
            </button>
          )}
          {user?.role === 'Admin' && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const result = await Swal.fire({
                  title: 'Are you sure?',
                  text: `Do you want to delete project "${row.title}"? This action cannot be undone.`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#d33',
                  cancelButtonColor: '#3085d6',
                  confirmButtonText: 'Yes, delete it!',
                });
                if (result.isConfirmed) {
                  try {
                    await deleteProject(row.id);
                    Swal.fire({
                      icon: 'success',
                      title: 'Deleted!',
                      text: `Project "${row.title}" has been deleted.`,
                      timer: 2000,
                      showConfirmButton: false,
                    });
                  } catch (error) {
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'Failed to delete project. Please try again.',
                      confirmButtonColor: '#d33',
                    });
                  }
                }
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
              <span className="material-icons text-xl">folder_open</span>
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme.textPrimary}`}>Projects</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                import('../utils/exportUtils').then((module) =>
                  module.exportToExcel(projects, 'Projects'),
                )
              }
              className={`${theme.successBg} ${theme.successText} p-2 rounded ${theme.shadow} transition-colors flex items-center gap-2`}
              title="Export to Excel"
            >
              <span className="material-icons text-sm">file_download</span>
              <span className="hidden md:inline">Export</span>
            </button>
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <button
                onClick={() => {
                  setEditingProject(null);
                  setFormData({
                    title: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    status: 'Planning',
                    assignedDeveloperId: '',
                  });
                  setShowForm(true);
                }}
                className={`${componentStyles.button.primary(theme)} flex items-center gap-2`}
              >
                <span className="material-icons text-sm">add</span>
                <span className="hidden lg:inline">New Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`flex flex-col lg:flex-row lg:items-center gap-3 ${theme.backgroundTertiary} p-3 rounded-md ${theme.borderColor} border`}
        >
          {/* Search & Mobile Toggle */}
          <div className="flex gap-2">
            <div className="relative flex-1 lg:w-auto">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full lg:w-64 pl-9 pr-4 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
              />
              <span className="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`lg:hidden p-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-slate-600 transition-colors ${showFilters ? 'bg-slate-100 ring-2 ring-blue-100' : ''
                }`}
            >
              <span className="material-icons">filter_list</span>
            </button>
          </div>

          {/* Collapsible Filters */}
          <div
            className={`${showFilters ? 'flex' : 'hidden'
              } lg:flex flex-col lg:flex-row gap-3 w-full lg:w-auto lg:items-center animate-fade-in-down lg:animate-none`}
          >
            <div className="relative group">
              <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-hover:text-blue-500 transition-colors">
                tune
              </span>
              <select className="w-full lg:w-auto pl-9 pr-8 py-2 text-sm border border-slate-300 rounded bg-white text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all hover:border-slate-400">
                <option>All Statuses</option>
                <option>Planning</option>
                <option>Active</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>

            <div className="h-8 w-px bg-slate-300 mx-1 hidden lg:block"></div>

            {/* Date Range */}
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex items-center bg-white border border-slate-300 rounded px-3 py-1.5 shadow-sm hover:border-slate-400 transition-colors">
                <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wide">
                  From
                </span>
                <input
                  type="date"
                  className="text-sm text-slate-600 focus:outline-none font-medium w-full lg:w-auto"
                />
              </div>
              <div className="flex items-center bg-white border border-slate-300 rounded px-3 py-1.5 shadow-sm hover:border-slate-400 transition-colors">
                <span className="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wide">
                  To
                </span>
                <input
                  type="date"
                  className="text-sm text-slate-600 focus:outline-none font-medium w-full lg:w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${theme.containerBgSolid} flex overflow-hidden relative`}>
        {/* Table Section */}
        <div
          className={`flex-1 transition-all duration-300 ${selectedProject ? 'lg:w-2/3 border-r border-slate-200' : 'w-full'
            }`}
        >
          <DynamicTable
            data={projects}
            columns={tableColumns}
            onRowClick={setSelectedProject}
            selectedRow={selectedProject}
            emptyMessage="No projects found"
            emptySubMessage="Create a new project to get started."
            emptyIcon="folder_open"
          />
        </div>

        {/* Details Panel */}
        {selectedProject && (
          <div
            className={`fixed inset-0 z-50 w-full h-full bg-white lg:static lg:w-1/3 lg:h-full flex flex-col animate-fade-in-right overflow-y-auto border-l ${theme.borderColor} ${theme.shadowStrong}`}
          >
            <div
              className={`p-5 ${theme.containerBgSolid} border-b ${theme.borderColor} flex justify-between items-center sticky top-0 z-10`}
            >
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="lg:hidden p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <span className="material-icons">arrow_back</span>
                </button>
                <h3
                  className={`font-bold ${theme.textPrimary} text-lg flex items-center gap-2`}
                >
                  <span className={`material-icons ${theme.primaryColor}`}>info</span>
                  Project Details #{selectedProject.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className={`${theme.textMuted} hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all`}
              >
                <span className="material-icons">close</span>
              </button>
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
                  {selectedProject.title}
                </p>
              </div>

              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                >
                  Status
                </label>
                <div
                  className={`mt-1 inline-flex items-center ${componentStyles.badge[
                      selectedProject.status === 'Active' ||
                        selectedProject.status === 'In Progress'
                        ? 'primary'
                        : selectedProject.status === 'Completed'
                          ? 'success'
                          : selectedProject.status === 'On Hold'
                            ? 'warning'
                            : 'primary'
                    ](theme)
                    }`}
                >
                  {selectedProject.status}
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
                  {selectedProject.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Start Date
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary}`}
                  >
                    {selectedProject.startDate}
                  </p>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    End Date
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary}`}
                  >
                    {selectedProject.endDate}
                  </p>
                </div>
              </div>

              <div className={`pt-4 border-t ${theme.borderColor}`}>
                <Link
                  to={`/projects/${selectedProject.id}`}
                  className={`w-full ${componentStyles.button.primary(
                    theme,
                  )} px-4 py-2 rounded text-sm font-medium ${theme.shadow} hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                >
                  <span className="material-icons text-sm">open_in_new</span>
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <DynamicForm
          fields={formFields}
          formData={formData}
          onChange={handleFieldChange}
          onSubmit={handleSubmitProject}
          onCancel={handleCancelForm}
          title={editingProject ? 'Edit Project' : 'Create New Project'}
          submitLabel={editingProject ? 'Update Project' : 'Create Project'}
          icon={editingProject ? 'edit' : 'post_add'}
          iconColor="purple"
          gridCols={2}
        />
      )}
    </div>
  );
};

export default ProjectsController;


