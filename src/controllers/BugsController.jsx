import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';
import { useTheme, componentStyles } from '../theme/theme';

const BugsController = () => {
  const { bugs, tasks, projects, addBug, updateBug, deleteBug } = useData();
  const { user, users } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [editingBug, setEditingBug] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    taskId: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    attachments: [],
  });

  // Debug: Log bugs and user info
  useEffect(() => {
    console.log('[BugsController] Bugs:', bugs.length, bugs);
    console.log('[BugsController] User:', user);
  }, [bugs, user]);

  const displayedBugs =
    user?.role === 'Developer' ? bugs.filter((b) => String(b.assignedTo) === String(user.id)) : bugs;

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleEditBug = (bug) => {
    setEditingBug(bug);
    setFormData({
      title: bug.title,
      description: bug.description,
      severity: bug.severity,
      taskId: (bug.taskId && String(bug.taskId).length > 5) ? bug.taskId : '',
      assignedTo: (bug.assignedTo && String(bug.assignedTo).length > 5) ? bug.assignedTo : '',
      startDate: bug.startDate,
      endDate: bug.endDate,
      attachments: bug.attachments || [],
    });
    setShowReportForm(true);
  };


  const handleSubmitBug = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.taskId) return;

    try {
      if (editingBug) {
        await updateBug(editingBug.id, {
          ...formData,
          taskId: formData.taskId,
          assignedTo: formData.assignedTo ? String(formData.assignedTo) : undefined,
        });
      } else {
        await addBug({
          ...formData,
          taskId: formData.taskId,
          assignedTo: formData.assignedTo ? String(formData.assignedTo) : undefined,
          reportedBy: user.id,
        });
      }
      handleCancelForm();
    } catch (error) {
      console.error('Error submitting bug:', error);
      // Error is already handled by DataContext with notifications
    }
  };

  const handleCancelForm = () => {
    setShowReportForm(false);
    setEditingBug(null);
    setFormData({
      title: '',
      description: '',
      severity: 'Medium',
      taskId: '',
      assignedTo: '',
      startDate: '',
      endDate: '',
      attachments: [],
    });
  };

  const handleStatusChange = (bugId, newStatus) => {
    updateBug(bugId, { status: newStatus });
    if (selectedBug && selectedBug.id === bugId) {
      setSelectedBug((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const getRelatedTaskTitle = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.title : 'Unknown Task';
  };

  const getProjectName = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return 'Unknown Project';
    const project = projects.find((p) => p.id === task.projectId);
    return project ? project.title : 'Unknown Project';
  };

  const getAssigneeName = (id) => {
    const assignee = users.find((u) => u.id === id);
    return assignee ? assignee.name : 'Unassigned';
  };

  const getReporterName = (id) => {
    const reporter = users.find((u) => u.id === id);
    return reporter ? reporter.name : 'Unknown';
  };

  const formFields = [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'E.g. Login failed on Safari',
      required: true,
      colSpan: 2,
    },
    {
      name: 'taskId',
      type: 'select',
      label: 'Related Task (Project)',
      placeholder: true,
      options: tasks.map((t) => {
        const project = projects.find((p) => p.id === t.projectId);
        return { value: t.id, label: `${t.title} (${project?.title || 'No Project'})` };
      }),
      required: true,
      colSpan: 1,
    },
    {
      name: 'severity',
      type: 'select',
      label: 'Severity',
      options: ['Low', 'Medium', 'High'],
      colSpan: 1,
    },
    {
      name: 'assignedTo',
      type: 'select',
      label: 'Assign To',
      options: users.map(u => ({ value: u.id, label: u.name })),
      colSpan: 1,
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Reported Date',
      colSpan: 1,
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'Target Close Date',
      colSpan: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Detailed description of the issue...',
      rows: 3,
      colSpan: 2,
    },
    {
      name: 'attachments',
      type: 'file',
      label: 'Attachments',
      multiple: true,
      colSpan: 2,
    },
  ];

  const tableColumns = [
    {
      key: 'title',
      label: 'Bug Title',
      render: (row) => (
        <span className="font-semibold text-slate-800 group-hover:text-blue-700">
          {row.title}
        </span>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="material-icons text-indigo-500 text-sm">folder</span>
          <span className="text-slate-700 font-medium text-xs">
            {getProjectName(row.taskId)}
          </span>
        </div>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (row) => {
        const severityColors = {
          High: 'bg-rose-50 text-rose-600 border-rose-100',
          Medium: 'bg-amber-50 text-amber-600 border-amber-100',
          Low: 'bg-blue-50 text-blue-600 border-blue-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityColors[row.severity] || severityColors.Medium
              }`}
          >
            {row.severity}
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
            className={`w-2 h-2 rounded-full ${row.status === 'Resolved'
              ? 'bg-emerald-500'
              : row.status === 'Open'
                ? 'bg-rose-500'
                : 'bg-blue-500'
              }`}
          ></span>
          <span className="text-slate-600 font-medium">{row.status}</span>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
            {getAssigneeName(row.assignedTo).charAt(0)}
          </div>
          {getAssigneeName(row.assignedTo)}
        </div>
      ),
    },
    {
      key: 'startDate',
      label: 'Date',
      render: (row) => <span className="text-slate-500 text-xs font-medium">{row.startDate}</span>,
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
          {(user?.role === 'Tester' ||
            user?.role === 'Manager' ||
            user?.role === 'Admin') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditBug(row);
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
                if (window.confirm('Delete bug report?')) deleteBug(row.id);
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
          <div className={`flex items_CENTER gap-2 ${theme.textPrimary}`}>
            <div className={`p-1.5 ${theme.accentBg} rounded-lg ${theme.textPrimary}`}>
              <span className="material-icons text-xl">bug_report</span>
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme.textPrimary}`}>
              Bug Tracker
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                import('../utils/exportUtils').then((module) =>
                  module.exportToExcel(displayedBugs, 'Bugs'),
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
                  setEditingBug(null);
                  setFormData({
                    title: '',
                    description: '',
                    severity: 'Medium',
                    taskId: '',
                    assignedTo: '',
                    startDate: '',
                    endDate: '',
                    attachments: [],
                  });
                  setShowReportForm(true);
                }}
                className={`${componentStyles.button.primary(theme)} flex items-center gap-2`}
              >
                <span className="material-icons text-sm">add</span>
                <span className="hidden md:inline">Report Bug</span>
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
                placeholder="Search bugs..."
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
              } md:flex flex-col md:flex-row gap-3 w_full md:w-auto md:items-center animate-fade-in-down md:animate-none`}
          >
            <div className="relative group">
              <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-hover:text-blue-500 transition-colors">
                filter_list
              </span>
              <select className="w-full md:w-auto pl-9 pr-8 py-2 text-sm border border-slate-300 rounded bg-white text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all hover:border-slate-400">
                <option>All Severities</option>
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
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
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
          className={`flex-1 transition-all duration-300 ${selectedBug ? `md:w-2/3 border-r ${theme.borderColor}` : 'w-full'
            }`}
        >
          <DynamicTable
            data={displayedBugs}
            columns={tableColumns}
            onRowClick={setSelectedBug}
            selectedRow={selectedBug}
            emptyMessage="No bugs found"
            emptySubMessage="Try adjusting your filters or report a new bug."
            emptyIcon="bug_report"
          />
        </div>

        {/* Details Panel */}
        {selectedBug && (
          <div
            className={`fixed inset-0 z-50 w-full h-full bg-white lg:static lg:w-1/3 lg:h-full 
                        flex flex-col animate-fade-in-right overflow-y-auto 
                        border-l ${theme.borderColor} ${theme.shadowStrong}`}
          >
            <div
              className={`p-5 ${theme.containerBgSolid} border-b ${theme.borderColor} flex justify-between items-center sticky top-0 z-10`}
            >
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setSelectedBug(null)}
                  className="lg:hidden p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <span className="material-icons">arrow_back</span>
                </button>
                <h3
                  className={`font-bold ${theme.textPrimary} text-lg flex items-center gap-2`}
                >
                  <span className={`material-icons ${theme.infoText}`}>info</span>
                  Bug Details #{selectedBug.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete bug report?')) {
                        deleteBug(selectedBug.id);
                        setSelectedBug(null);
                      }
                    }}
                    className={`${theme.textMuted} hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all mr-1`}
                    title="Delete Bug Report"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedBug(null)}
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
                  {selectedBug.title}
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
                    value={selectedBug.status}
                    onChange={(e) => handleStatusChange(selectedBug.id, e.target.value)}
                    className={componentStyles.input(theme)}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Severity
                  </label>
                  <div
                    className={`mt-1 inline-flex items-center ${componentStyles.badge[
                      selectedBug.severity === 'High'
                        ? 'error'
                        : selectedBug.severity === 'Medium'
                          ? 'warning'
                          : 'primary'
                    ](theme)}`}
                  >
                    {selectedBug.severity}
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
                  {selectedBug.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Project
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`material-icons ${theme.primaryColor} text-sm`}>folder</span>
                    <span className={`text-sm font-medium ${theme.textSecondary}`}>
                      {getProjectName(selectedBug.taskId)}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Related Task
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary}`}
                  >
                    {getRelatedTaskTitle(selectedBug.taskId)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Assigned To
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full ${theme.accentBg} ${theme.textPrimary} flex items-center justify-center text-xs font-bold`}
                    >
                      {getAssigneeName(selectedBug.assignedTo).charAt(0)}
                    </div>
                    <span
                      className={`text-sm font-medium ${theme.textSecondary}`}
                    >
                      {getAssigneeName(selectedBug.assignedTo)}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Reported By
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary}`}
                  >
                    {getReporterName(selectedBug.reportedBy)}
                  </p>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest mb-3 block border-b ${theme.borderColorLight} pb-2`}
                >
                  Attachments ({selectedBug.attachments?.length || 0})
                </label>
                <div className="space-y-3">
                  {selectedBug.attachments && selectedBug.attachments.length > 0 ? (
                    selectedBug.attachments.map((file, idx) => {
                      const isString = typeof file === 'string';
                      const fileName = isString ? file.split('/').pop() : file.name;
                      const fileUrl = isString ? file : file.url;
                      return (
                        <div
                          key={idx}
                          className={`group relative flex items-start gap-3 p-3 ${theme.containerBgSolid} ${theme.borderColor} border rounded-xl hover:shadow-md hover:border-blue-300 transition-all`}
                        >
                          <div
                            className={`w-12 h-12 flex-shrink-0 ${theme.backgroundTertiary} rounded-lg overflow-hidden ${theme.borderColor} border flex items-center justify-center`}
                          >
                            <img
                              src={fileUrl}
                              alt="preview"
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              onError={(e) => {
                                e.target.src =
                                  'https://via.placeholder.com/150?text=IMG';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold ${theme.textSecondary} truncate`}
                              title={fileName}
                            >
                              {fileName}
                            </p>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-xs ${theme.primaryColor} hover:opacity-80 mt-1 inline-flex items-center font-medium`}
                            >
                              View File{' '}
                              <span className="material-icons text-[10px] ml-1">
                                open_in_new
                              </span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className={`text-sm ${theme.textMuted} italic`}>
                      No attachments available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <DynamicForm
          fields={formFields}
          formData={formData}
          onChange={handleFieldChange}
          onSubmit={handleSubmitBug}
          onCancel={handleCancelForm}
          title={editingBug ? 'Edit Bug Report' : 'Report New Bug'}
          submitLabel={editingBug ? 'Update Bug' : 'Submit Report'}
          icon={editingBug ? 'edit' : 'bug_report'}
          iconColor="red"
          gridCols={2}
        />
      )}
    </div>
  );
};

export default BugsController;


