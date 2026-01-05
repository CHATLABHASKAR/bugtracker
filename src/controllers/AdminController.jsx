import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';
import { useTheme, componentStyles } from '../theme/theme';
import api from '../services/api';

const AdminController = () => {
  const { users, addUser, updateUser, deleteUser, user } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', role: 'Developer', avatar: '' });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeStats, setEmployeeStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const { theme, isDarkMode } = useTheme();

  if (!user || (user.role !== 'Admin' && user.role !== 'admin')) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-[60vh] text-center ${
          isDarkMode ? theme.background : 'bg-gray-50'
        }`}
      >
        <div
          className={`w-20 h-20 ${theme.errorBg} rounded-full flex items-center justify-center mb-4`}
        >
          <span className={`material-icons ${theme.errorText} text-4xl`}>lock</span>
        </div>
        <h2 className={`text-2xl font-bold ${theme.textPrimary}`}>Access Denied</h2>
        <p className={`${theme.textMuted} mt-2`}>You do not have permission to view this page.</p>
      </div>
    );
  }

  const handleFieldChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    // Extract avatar URL if it's an object (from file upload)
    const submitData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.avatar?.url || formData.avatar || '',
    };

    let success = false;
    if (isEditing && editId) {
      // Validate ID exists
      if (!editId) {
        alert('Cannot update: Employee ID is missing');
        return;
      }
      // Ensure ID is converted to string for API call
      const userId = String(editId);
      success = await updateUser(userId, submitData);
    } else {
      success = await addUser(submitData);
    }

    if (success) {
      handleCancelForm();
    } else {
      alert('Operation failed. Please check console.');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', email: '', role: 'Developer', avatar: '' });
  };

  const handleEditClick = (employee, e) => {
    e.stopPropagation();
    // Get ID from employee object (handle both 'id' and '_id' fields)
    const employeeId = employee.id || employee._id;
    if (!employeeId) {
      console.error('Employee ID is missing:', employee);
      alert('Cannot edit: Employee ID is missing');
      return;
    }
    setFormData({ 
      name: employee.name, 
      email: employee.email, 
      role: employee.role,
      avatar: employee.avatar || ''
    });
    // Ensure ID is stored as string for API calls
    setEditId(String(employeeId));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = async (id, e) => {
    e.stopPropagation();
    // Validate ID exists
    if (!id) {
      console.error('Employee ID is missing');
      alert('Cannot delete: Employee ID is missing');
      return;
    }
    if (window.confirm('Are you sure you want to delete this employee?')) {
      // Ensure ID is converted to string for API call
      const userId = String(id);
      const success = await deleteUser(userId);
      if (success) {
        // Compare IDs as strings (handle both 'id' and '_id' fields)
        const selectedId = selectedEmployee?.id || selectedEmployee?._id;
        if (selectedEmployee && String(selectedId) === userId) {
          setSelectedEmployee(null);
        }
      } else {
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  // Fetch employee statistics from API
  useEffect(() => {
    const fetchEmployeeStats = async () => {
      if (!selectedEmployee || !selectedEmployee.id) {
        setEmployeeStats(null);
        return;
      }

      setStatsLoading(true);
      try {
        // Pass the user/employee ID to fetch statistics
        const employeeId = String(selectedEmployee.id);
        const stats = await api.getUserStatistics(employeeId);
        
        // Map API response to component's expected format
        const mappedStats = {
          projects: stats.projects || [],
          totalTasks: stats.tasks?.total || 0,
          completedTasks: stats.tasks?.completed || 0,
          pendingTasks: stats.tasks?.pending || 0,
          inProgressTasks: stats.tasks?.inProgress || 0,
          totalBugs: stats.bugs?.total || 0,
          fixedBugs: stats.bugs?.fixed || 0,
          openBugs: stats.bugs?.open || 0,
          inProgressBugs: stats.bugs?.inProgress || 0,
          completionRate: stats.tasks?.completionRate || 0,
          fixRate: stats.bugs?.fixRate || 0,
          performance: stats.performance || {},
        };
        
        setEmployeeStats(mappedStats);
      } catch (error) {
        console.error('Failed to fetch employee statistics:', error);
        setEmployeeStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchEmployeeStats();
  }, [selectedEmployee]);

  const formFields = [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
      placeholder: 'John Doe',
      required: true,
      colSpan: 1,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'john@example.com',
      required: true,
      colSpan: 1,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'Manager', label: 'Manager' },
        { value: 'Developer', label: 'Developer' },
        { value: 'Tester', label: 'Tester' },
        { value: 'Admin', label: 'Admin' },
      ],
      colSpan: 1,
    },
    {
      name: 'avatar',
      type: 'file',
      label: 'Profile Picture',
      accept: 'image/*',
      colSpan: 3,
      render: (value, onChange, formData) => (
        <div className="col-span-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
          </label>
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onChange({ name: file.name, url: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {(value?.url || (typeof value === 'string' && value)) && (
              <div className="mt-3">
                <p className="text-xs text-slate-600 font-medium mb-2">Preview:</p>
                <div className="relative inline-block">
                  <img
                    src={value?.url || value}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full border-4 border-slate-200 object-cover shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md"
                    title="Remove image"
                  >
                    <span className="material-icons text-sm">close</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const tableColumns = [
    {
      key: 'name',
      label: 'Employee Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 h-10 w-10 relative">
            <img
              className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
              src={row.avatar || `https://ui-avatars.com/api/?name=${row.name}&background=random`}
              alt=""
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="font-semibold text-slate-800 group-hover:text-blue-700">
            {row.name}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="text-slate-600">{row.email}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => {
        const roleColors = {
          Admin: 'bg-purple-50 text-purple-600 border-purple-100',
          Manager: 'bg-blue-50 text-blue-600 border-blue-100',
          Tester: 'bg-amber-50 text-amber-600 border-amber-100',
          Developer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              roleColors[row.role] || roleColors.Developer
            }`}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'ID',
      render: (row) => {
        const employeeId = row.id || row._id || 'N/A';
        return <span className="text-slate-500 text-xs font-medium font-mono">#{employeeId}</span>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => handleEditClick(row, e)}
            className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit User"
          >
            <span className="material-icons text-lg">edit</span>
          </button>
          <button
            onClick={(e) => handleDeleteClick(row.id || row._id, e)}
            className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete User"
          >
            <span className="material-icons text-lg">delete</span>
          </button>
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
              <span className="material-icons text-xl">admin_panel_settings</span>
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${theme.textPrimary}`}>Admin Panel</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                import('../utils/exportUtils').then((module) =>
                  module.exportToExcel(users, 'Employees'),
                )
              }
              className={`${theme.successBg} ${theme.successText} p-2 rounded ${theme.shadow} transition-colors flex items-center gap-2`}
              title="Export to Excel"
            >
              <span className="material-icons text-sm">file_download</span>
              <span className="hidden lg:inline">Export</span>
            </button>
            <button
              onClick={() => {
                setFormData({ name: '', email: '', role: 'Developer', avatar: '' });
                setIsEditing(false);
                setEditId(null);
                setShowForm(true);
              }}
              className={`${componentStyles.button.primary(theme)} flex items-center gap-2`}
            >
              <span className="material-icons text-sm">person_add</span>
              <span className="hidden lg:inline">Add Employee</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`flex flex-wrap items-center gap-3 ${theme.backgroundTertiary} p-3 rounded-md ${theme.borderColor} border`}
        >
          <div className="relative group">
            <span className="material-icons absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-hover:text-blue-500 transition-colors">
              filter_list
            </span>
            <select className="pl-9 pr-8 py-2 text-sm border border-slate-300 rounded bg-white text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all hover:border-slate-400">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Developer</option>
              <option>Tester</option>
            </select>
          </div>

          <div className="h-8 w-px bg-slate-300 mx-1 hidden md:block"></div>

          {/* Search */}
          <div className="relative ml-auto w-full md:w-auto">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full md:w-64 pl-9 pr-4 py-2 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
            />
            <span className="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${theme.containerBgSolid} flex overflow-hidden relative`}>
        {/* Table Section */}
        <div
          className={`flex-1 transition-all duration-300 ${
            selectedEmployee ? `lg:w-2/3 border-r ${theme.borderColor}` : 'w-full'
          }`}
        >
          <DynamicTable
            data={users}
            columns={tableColumns}
            onRowClick={setSelectedEmployee}
            selectedRow={selectedEmployee}
            emptyMessage="No employees found"
            emptySubMessage="Add a new employee to get started."
            emptyIcon="people"
          />
        </div>

        {/* Details Panel */}
        {selectedEmployee && (
          <div
            className={`fixed inset-0 z-50 w-full h-full ${theme.containerBgSolid} lg:static lg:w-1/3 lg:h-full flex flex-col animate-fade-in-right overflow-y-auto border-l ${theme.borderColor} ${theme.shadowStrong} z-20`}
          >
            <div
              className={`p-5 ${theme.containerBgSolid} border-b ${theme.borderColor} flex justify-between items-center sticky top-0 z-10`}
            >
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="lg:hidden p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <span className="material-icons">arrow_back</span>
                </button>
                <h3
                  className={`font-bold ${theme.textPrimary} text-lg flex items-center gap-2`}
                >
                  <span className={`material-icons ${theme.infoText}`}>info</span>
                  Employee Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className={`${theme.textMuted} hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-all`}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div
                className={`flex flex-col items-center text-center pb-6 border-b ${theme.borderColorLight}`}
              >
                <div className="relative mb-4">
                  <img
                    className={`h-24 w-24 rounded-full border-4 ${theme.containerBgSolid} ${theme.shadowStrong}`}
                    src={
                      selectedEmployee.avatar ||
                      `https://ui-avatars.com/api/?name=${selectedEmployee.name}&background=random`
                    }
                    alt=""
                  />
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-3 border-white rounded-full"></div>
                </div>
                <h4 className={`text-xl font-bold ${theme.textPrimary}`}>
                  {selectedEmployee.name}
                </h4>
                <p className={`text-sm ${theme.textMuted} mt-1`}>{selectedEmployee.email}</p>
              </div>

              {/* Detail Fields */}
              <div
                className={`grid grid-cols-2 gap-6 p-4 ${theme.backgroundTertiary} rounded-lg ${theme.borderColor} border`}
              >
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Role
                  </label>
                  <div
                    className={`mt-1 inline-flex items-center ${componentStyles.badge[
                      selectedEmployee.role === 'Admin'
                        ? 'primary'
                        : selectedEmployee.role === 'Manager'
                        ? 'primary'
                        : selectedEmployee.role === 'Tester'
                        ? 'warning'
                        : 'success'
                    ](theme)}`}
                  >
                    {selectedEmployee.role}
                  </div>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Employee ID
                  </label>
                  <p
                    className={`mt-1 text-sm font-medium ${theme.textSecondary} font-mono`}
                  >
                    #{selectedEmployee.id || selectedEmployee._id || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                >
                  Email Address
                </label>
                <div
                  className={`mt-2 p-4 ${theme.backgroundTertiary} ${theme.borderColor} border rounded-lg text-sm ${theme.textSecondary} leading-relaxed font-medium`}
                >
                  {selectedEmployee.email}
                </div>
              </div>

              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                >
                  Full Name
                </label>
                <div
                  className={`mt-2 p-4 ${theme.backgroundTertiary} ${theme.borderColor} border rounded-lg text-sm ${theme.textSecondary} leading-relaxed font-medium`}
                >
                  {selectedEmployee.name}
                </div>
              </div>

              {/* Employee Statistics Section */}
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className={`text-sm ${theme.textMuted}`}>Loading statistics...</div>
                </div>
              ) : employeeStats ? (
                <>
                  {/* Projects Section */}
                  <div>
                    <label
                      className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest mb-3 block border-b ${theme.borderColorLight} pb-2 flex items-center gap-2`}
                    >
                      <span className="material-icons text-base">folder</span>
                      Projects ({employeeStats.projects.length})
                    </label>
                    {employeeStats.projects.length > 0 ? (
                      <div className="space-y-2">
                        {employeeStats.projects.map((project) => (
                          <div
                            key={project.id}
                            className={`p-3 ${theme.backgroundTertiary} ${theme.borderColor} border rounded-lg flex items-center gap-3`}
                          >
                            <span className={`material-icons ${theme.primaryColor} text-lg`}>
                              folder
                            </span>
                            <div className="flex-1">
                              <p className={`text-sm font-semibold ${theme.textSecondary}`}>
                                {project.title}
                              </p>
                              <p className={`text-xs ${theme.textMuted} mt-0.5`}>
                                {project.status || 'Active'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-sm ${theme.textMuted} italic`}>
                        No projects assigned
                      </p>
                    )}
                  </div>

                  {/* Tasks Statistics */}
                  <div>
                    <label
                      className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest mb-3 block border-b ${theme.borderColorLight} pb-2 flex items-center gap-2`}
                    >
                      <span className="material-icons text-base">task</span>
                      Tasks Overview
                    </label>
                    <div className={`grid grid-cols-2 gap-4 p-4 ${theme.backgroundTertiary} rounded-lg ${theme.borderColor} border`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                          {employeeStats.totalTasks}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>Total Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-green-600`}>
                          {employeeStats.completedTasks}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>Completed</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-blue-600`}>
                          {employeeStats.inProgressTasks}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-amber-600`}>
                          {employeeStats.pendingTasks}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>Pending</div>
                      </div>
                    </div>
                    {employeeStats.totalTasks > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${theme.textSecondary}`}>
                            Completion Rate
                          </span>
                          <span className={`text-xs font-bold ${theme.textPrimary}`}>
                            {employeeStats.completionRate || Math.round((employeeStats.completedTasks / employeeStats.totalTasks) * 100)}%
                          </span>
                        </div>
                        <div className={`w-full h-2 ${theme.backgroundTertiary} rounded-full overflow-hidden`}>
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{
                              width: `${employeeStats.completionRate || (employeeStats.completedTasks / employeeStats.totalTasks) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bugs Statistics */}
                  <div>
                    <label
                      className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest mb-3 block border-b ${theme.borderColorLight} pb-2 flex items-center gap-2`}
                    >
                      <span className="material-icons text-base">bug_report</span>
                      Bugs Overview
                    </label>
                    <div className={`grid grid-cols-2 gap-4 p-4 ${theme.backgroundTertiary} rounded-lg ${theme.borderColor} border`}>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${theme.textPrimary}`}>
                          {employeeStats.totalBugs}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>Total Bugs</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-green-600`}>
                          {employeeStats.fixedBugs}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>Fixed</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-blue-600`}>
                          {employeeStats.inProgressBugs}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>In Progress</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold text-rose-600`}>
                          {employeeStats.openBugs}
                        </div>
                        <div className={`text-xs ${theme.textMuted} mt-1`}>Open</div>
                      </div>
                    </div>
                    {employeeStats.totalBugs > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${theme.textSecondary}`}>
                            Fix Rate
                          </span>
                          <span className={`text-xs font-bold ${theme.textPrimary}`}>
                            {employeeStats.fixRate || Math.round((employeeStats.fixedBugs / employeeStats.totalBugs) * 100)}%
                          </span>
                        </div>
                        <div className={`w-full h-2 ${theme.backgroundTertiary} rounded-full overflow-hidden`}>
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{
                              width: `${employeeStats.fixRate || (employeeStats.fixedBugs / employeeStats.totalBugs) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary Card */}
                  <div className={`p-4 ${theme.primaryBg} ${theme.borderColor} border rounded-lg`}>
                    <label
                      className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest mb-2 block`}
                    >
                      Performance Summary
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme.textSecondary}`}>Tasks Completed</span>
                        <span className={`text-sm font-bold ${theme.textPrimary}`}>
                          {employeeStats.performance?.tasksCompleted || `${employeeStats.completedTasks} / ${employeeStats.totalTasks}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme.textSecondary}`}>Bugs Fixed</span>
                        <span className={`text-sm font-bold ${theme.textPrimary}`}>
                          {employeeStats.performance?.bugsFixed || `${employeeStats.fixedBugs} / ${employeeStats.totalBugs}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${theme.textSecondary}`}>Active Projects</span>
                        <span className={`text-sm font-bold ${theme.textPrimary}`}>
                          {employeeStats.performance?.activeProjects !== undefined ? employeeStats.performance.activeProjects : employeeStats.projects.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className={`text-sm ${theme.textMuted} italic text-center py-4`}>
                  No statistics available
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Form Modal */}
      {showForm && (
        <DynamicForm
          fields={formFields}
          formData={formData}
          onChange={handleFieldChange}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          title={isEditing ? 'Edit Employee' : 'Add New Employee'}
          submitLabel={isEditing ? 'Update Employee' : 'Save Employee'}
          icon={isEditing ? 'edit' : 'person_add'}
          iconColor="purple"
          gridCols={3}
        />
      )}
    </div>
  );
};

export default AdminController;


