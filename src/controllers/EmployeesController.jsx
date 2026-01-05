import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';
import { useTheme, componentStyles } from '../theme/theme';

const EmployeesController = () => {
  const { theme, isDarkMode } = useTheme();
  const { users, addUser, updateUser, deleteUser, user } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Developer' });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!user || user.role !== 'Admin') {
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

    const submitData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    };

    // Only include password when creating new user (not when editing)
    if (!isEditing && formData.password) {
      submitData.password = formData.password;
    }

    if (isEditing && editId) {
      // Ensure ID is converted to string for API call
      const userId = String(editId);
      await updateUser(userId, submitData);
    } else {
      await addUser(submitData);
    }
    handleCancelForm();
  };

  const handleEditClick = (employee, e) => {
    e.stopPropagation();
    setFormData({ name: employee.name, email: employee.email, password: '', role: employee.role });
    // Ensure ID is stored as string for API calls
    setEditId(String(employee.id));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this employee?')) {
      // Ensure ID is converted to string for API call
      const userId = String(id);
      const success = await deleteUser(userId);
      if (success) {
        // Compare IDs as strings
        if (selectedEmployee && String(selectedEmployee.id) === userId) {
          setSelectedEmployee(null);
        }
      } else {
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', email: '', password: '', role: 'Developer' });
  };

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
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter password',
      required: !isEditing, // Only required when creating new user
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
  ];

  const tableColumns = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 relative">
            <img
              className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
              src={row.avatar || `https://ui-avatars.com/api/?name=${row.name}&background=random`}
              alt=""
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {row.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => {
        const roleColors = {
          Admin: 'bg-purple-100 text-purple-700',
          Manager: 'bg-blue-100 text-blue-700',
          Tester: 'bg-amber-100 text-amber-700',
          Developer: 'bg-emerald-100 text-emerald-700',
        };
        return (
          <span
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              roleColors[row.role] || roleColors.Developer
            }`}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => <span className="text-sm text-gray-500">{row.email}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
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
            onClick={(e) => handleDeleteClick(row.id, e)}
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
      {/* Page Header */}
      <div className={`${theme.containerBgSolid} border-b ${theme.borderColor} p-4`}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-3xl font-bold ${theme.textPrimary} tracking-tight`}>Employees</h1>
            <p className={`${theme.textMuted} mt-1`}>Manage team members.</p>
          </div>
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
                setFormData({ name: '', email: '', password: '', role: 'Developer' });
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
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${theme.containerBgSolid} flex overflow-hidden relative`}>
        <div
          className={`flex-1 transition-all duration-300 ${
            selectedEmployee ? 'lg:w-2/3 border-r border-slate-200' : 'w-full'
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
            className={`fixed inset-0 z-50 w-full h-full ${theme.containerBgSolid} lg:static lg:w-1/3 lg:h-full 
                        flex flex-col animate-fade-in-right overflow-y-auto 
                        border-l ${theme.borderColor} ${theme.shadowStrong}`}
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
                  <span className={`material-icons ${theme.infoText}`}>badge</span>
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.name}
                    className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <label
                    className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                  >
                    Name
                  </label>
                  <p
                    className={`${theme.textPrimary} font-bold text-xl mt-0.5 leading-snug`}
                  >
                    {selectedEmployee.name}
                  </p>
                </div>
              </div>

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
                    className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold
                                        ${
                                          selectedEmployee.role === 'Admin'
                                            ? 'bg-purple-100 text-purple-700'
                                            : selectedEmployee.role === 'Manager'
                                            ? 'bg-blue-100 text-blue-700'
                                            : selectedEmployee.role === 'Tester'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}
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
                  <div className="flex items-center gap-2 mt-2">
                    <span className="material-icons text-slate-400 text-sm">
                      fingerprint
                    </span>
                    <span
                      className={`text-sm font-mono font-medium ${theme.textPrimary}`}
                    >
                      #{selectedEmployee.id}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  className={`text-xs font-bold ${theme.textMuted} uppercase tracking-widest`}
                >
                  Email Address
                </label>
                <div
                  className={`mt-2 p-4 ${theme.backgroundTertiary} ${theme.borderColor} border rounded-lg text-sm ${theme.textPrimary} flex items-center gap-2`}
                >
                  <span className="material-icons text-slate-400 text-sm">email</span>
                  {selectedEmployee.email}
                </div>
              </div>
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
          title="Add New Employee"
          submitLabel="Save Employee"
          icon="person_add"
          iconColor="blue"
          gridCols={3}
        />
      )}
    </div>
  );
};

export default EmployeesController;


