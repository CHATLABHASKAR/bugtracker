import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme, componentStyles } from '../theme/theme';
import DynamicForm from '../components/DynamicForm';
import DynamicTable from '../components/DynamicTable';
import Swal from 'sweetalert2';
import api from '../services/api';

const ProjectDetailsController = () => {
  console.log('🔵 ProjectDetailsController rendering...');

  const { id } = useParams();
  console.log('🔵 Project ID from URL:', id);

  const { modules, tasks, bugs, addTask, updateTask, deleteTask, addModule, updateModule, deleteModule, addBug, updateBug, deleteBug } = useData();
  const { user: currentUser, users } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // State for project fetched by ID
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

  // View states: 'project' | 'modules-tasks' | 'modules-bugs' | 'task-detail' | 'bug-detail'
  const [viewMode, setViewMode] = useState('project');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedBug, setSelectedBug] = useState(null);

  // Form states
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddBugModal, setShowAddBugModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingBug, setEditingBug] = useState(null);
  const [moduleFormData, setModuleFormData] = useState({ name: '', description: '', status: 'Planning' });
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    assignedTo: currentUser?.id || '',
    priority: 'Medium',
    startDate: '',
    endDate: '',
  });
  const [bugFormData, setBugFormData] = useState({
    title: '',
    description: '',
    taskId: '',
    moduleId: '',
    severity: 'Medium',
    assignedTo: '',
    startDate: '',
    attachments: [],
  });

  // Fetch project by ID from API
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
        console.log('🔵 No project ID provided');
        setProjectLoading(false);
        return;
      }

      console.log('🔵 Fetching project with ID:', id);
      setProjectLoading(true);
      setProjectError(null);

      try {
        const projectId = String(id);
        console.log('🔵 Calling api.getProject with:', projectId);
        const fetchedProject = await api.getProject(projectId);
        console.log('🔵 Fetched project:', fetchedProject);

        if (!fetchedProject || !fetchedProject.id) {
          throw new Error('Invalid project data received from API');
        }

        setProject(fetchedProject);
        console.log('🔵 Project set successfully');
      } catch (error) {
        console.error('🔵 Failed to fetch project:', error);
        console.error('🔵 Error details:', {
          message: error.message,
          response: error.response,
          stack: error.stack
        });
        setProjectError(error.message || 'Failed to load project');
        setProject(null);
      } finally {
        setProjectLoading(false);
        console.log('🔵 Project loading finished');
      }
    };

    fetchProject();
  }, [id]);

  // Ensure we have arrays to work with
  const safeModules = Array.isArray(modules) ? modules : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeBugs = Array.isArray(bugs) ? bugs : [];

  // Only filter data if project is loaded (but don't use in hooks yet)
  const projectModules = project ? safeModules.filter((m) => String(m.projectId) === String(project.id)) : [];
  const projectTasks = project ? safeTasks.filter((t) => String(t.projectId) === String(project.id)) : [];
  // Filter bugs: bugs belong to this project if their task belongs to this project
  const projectBugs = project ? safeBugs.filter((b) => {
    // Debug each bug
    if (!b || !b.taskId) {
      console.log('🔵 Bug filtered out (no taskId):', b);
      return false;
    }

    // Ensure both IDs are strings for comparison
    const bugTaskId = String(b.taskId).trim();
    if (!bugTaskId) {
      console.log('🔵 Bug filtered out (empty taskId):', b);
      return false;
    }

    // Find if the bug's task belongs to this project
    const bugTask = projectTasks.find(t => {
      const taskId = String(t.id || '').trim();
      const match = taskId === bugTaskId;
      if (!match && projectTasks.length > 0) {
        // Only log first few mismatches to avoid spam
        const isFirstFew = projectTasks.indexOf(t) < 3;
        if (isFirstFew) {
          console.log('🔵 Bug task mismatch:', {
            bugId: b.id,
            bugTitle: b.title,
            bugTaskId: bugTaskId,
            taskId: taskId,
            taskTitle: t.title
          });
        }
      }
      return match;
    });

    const willShow = bugTask !== undefined;
    if (!willShow && projectTasks.length > 0) {
      console.log('🔵 Bug will NOT show:', {
        bugId: b.id,
        bugTitle: b.title,
        bugTaskId: bugTaskId,
        availableTaskIds: projectTasks.slice(0, 5).map(t => String(t.id))
      });
    }

    return willShow;
  }) : [];

  // Debug logging for bugs
  useEffect(() => {
    if (project) {
      console.log('🔵 Bugs Debug Summary:', {
        totalBugs: bugs.length,
        projectBugs: projectBugs.length,
        projectTasks: projectTasks.length,
        bugsWithTaskId: bugs.filter(b => b.taskId).length,
        bugsWithoutTaskId: bugs.filter(b => !b.taskId).length,
        sampleBugs: bugs.slice(0, 5).map(b => ({
          id: b.id,
          title: b.title,
          taskId: b.taskId,
          taskIdType: typeof b.taskId,
          taskIdString: String(b.taskId || '')
        })),
        sampleProjectTasks: projectTasks.slice(0, 5).map(t => ({
          id: t.id,
          idString: String(t.id || ''),
          title: t.title,
          idType: typeof t.id
        })),
        // Check which bugs will match
        matchingBugs: bugs.filter(b => {
          if (!b.taskId) return false;
          const bugTaskId = String(b.taskId).trim();
          return projectTasks.some(t => String(t.id || '').trim() === bugTaskId);
        }).map(b => ({ id: b.id, title: b.title, taskId: String(b.taskId) }))
      });
    }
  }, [project, bugs, projectBugs, projectTasks]);

  // Debug logging - MUST be before any conditional returns
  useEffect(() => {
    if (project) {
      console.log('🔵 Project Details Data:', {
        projectId: project?.id,
        projectTitle: project?.title,
        projectModules: projectModules.length,
        projectTasks: projectTasks.length,
        projectBugs: projectBugs.length,
        tasksWithModuleId: projectTasks.filter(t => t.moduleId).length,
        tasksWithoutModuleId: projectTasks.filter(t => !t.moduleId).length,
        sampleTasks: projectTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, moduleId: t.moduleId, projectId: t.projectId })),
        sampleBugs: projectBugs.slice(0, 3).map(b => ({ id: b.id, title: b.title, taskId: b.taskId }))
      });
    }
  }, [project, projectModules, projectTasks, projectBugs]);

  // Show loading state
  if (projectLoading) {
    return (
      <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} min-h-screen p-4 md:p-6 flex items-center justify-center`}>
        <div className="text-center">
          <div className={`text-2xl ${theme.textPrimary} mb-4`}>Loading project...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show error or not found state
  if (projectError || !project) {
    return (
      <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} min-h-screen p-4 md:p-6 flex items-center justify-center`}>
        <div className={`${componentStyles.card(theme)} text-center max-w-md`}>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Project Not Found</h2>
          <p className={`${theme.textSecondary} mb-4`}>Project ID: {id}</p>
          {projectError && (
            <p className={`${theme.errorText} text-sm mb-4`}>{projectError}</p>
          )}
          <Link
            to="/projects"
            className={`${componentStyles.button.primary(theme)} inline-flex items-center gap-2`}
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }


  const getAssigneeName = (userId) => {
    if (!userId) return 'Unassigned';
    const assignee = users.find((u) => String(u.id) === String(userId));
    return assignee ? assignee.name : 'Unassigned';
  };

  const getDeveloperName = (userId) => {
    if (!userId) return 'Unassigned';
    const dev = users.find((u) => String(u.id) === String(userId));
    return dev ? dev.name : 'Unassigned';
  };

  // Module handlers
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleFormData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Module name is required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    try {
      await addModule(project.id, moduleFormData);
      setModuleFormData({ name: '', description: '', status: 'Planning' });
      setShowAddModuleModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Module "${moduleFormData.name}" created successfully`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create module. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleFormData({
      name: module.name,
      description: module.description || '',
      status: module.status,
    });
    setShowAddModuleModal(true);
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    if (!moduleFormData.name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Module name is required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    try {
      await updateModule(project.id, editingModule.id, moduleFormData);
      setEditingModule(null);
      setModuleFormData({ name: '', description: '', status: 'Planning' });
      setShowAddModuleModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Module "${moduleFormData.name}" updated successfully`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update module. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteModule(project.id, moduleId);
        if (selectedModule && selectedModule.id === moduleId) {
          setSelectedModule(null);
        }
        Swal.fire(
          'Deleted!',
          'Your module has been deleted.',
          'success'
        );
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete module.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Task handlers
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim() || !taskFormData.moduleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Task title and module are required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    try {
      await addTask({
        projectId: project.id,
        moduleId: taskFormData.moduleId,
        ...taskFormData,
        assignedTo: taskFormData.assignedTo,
        status: 'Pending',
      });
      setTaskFormData({
        title: '',
        description: '',
        moduleId: '',
        assignedTo: currentUser?.id || '',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        attachments: [],
      });
      setShowAddTaskModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Task "${taskFormData.title}" created successfully`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create task. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Task status updated to ${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task status. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      moduleId: task.moduleId || '',
      assignedTo: task.assignedTo || currentUser?.id || '',
      priority: task.priority || 'Medium',
      startDate: task.startDate || '',
      endDate: task.endDate || '',
      attachments: task.attachments || [],
    });
    setShowAddTaskModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim() || !taskFormData.moduleId) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Task title and module are required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      await updateTask(editingTask.id, {
        ...taskFormData,
        projectId: project.id,
        moduleId: taskFormData.moduleId,
        assignedTo: taskFormData.assignedTo,
      });

      setEditingTask(null);
      setTaskFormData({
        title: '',
        description: '',
        moduleId: '',
        assignedTo: currentUser?.id || '',
        priority: 'Medium',
        startDate: '',
        endDate: '',
        attachments: [],
      });
      setShowAddTaskModal(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Task "${taskFormData.title}" updated successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update task. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteTask(taskId);
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(null);
        }
        Swal.fire(
          'Deleted!',
          'Task has been deleted.',
          'success'
        );
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete task.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Bug handlers
  const handleAddBug = async (e) => {
    e.preventDefault();

    // Debug: Log form data
    console.log('🔵 Bug Form Data:', bugFormData);
    console.log('🔵 Title:', bugFormData.title, 'trimmed:', bugFormData.title?.trim());
    console.log('🔵 TaskId:', bugFormData.taskId, 'type:', typeof bugFormData.taskId);

    // Validate: check if title is empty or taskId is missing/empty
    const titleValid = bugFormData.title && bugFormData.title.trim().length > 0;
    const taskIdValid = bugFormData.taskId !== null && bugFormData.taskId !== undefined && bugFormData.taskId !== '';

    if (!titleValid || !taskIdValid) {
      console.error('🔵 Validation failed:', { titleValid, taskIdValid, formData: bugFormData });
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Bug title and task are required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    try {
      // Ensure taskId is converted to string (API expects string IDs)
      const taskIdValue = String(bugFormData.taskId);
      const assignedToValue = bugFormData.assignedTo ? String(bugFormData.assignedTo) : undefined;

      console.log('🔵 Submitting bug with:', {
        title: bugFormData.title,
        taskId: taskIdValue,
        assignedTo: assignedToValue,
        reportedBy: currentUser.id
      });

      const createdBug = await addBug({
        ...bugFormData,
        taskId: taskIdValue,
        assignedTo: assignedToValue,
        reportedBy: currentUser.id || currentUser._id,
        status: 'Open',
      });

      console.log('🔵 Bug created successfully:', createdBug);
      console.log('🔵 Created bug taskId:', createdBug.taskId, 'type:', typeof createdBug.taskId);
      console.log('🔵 Current bugs state count:', bugs.length);
      console.log('🔵 Project tasks count:', projectTasks.length);
      console.log('🔵 Project tasks IDs:', projectTasks.map(t => ({ id: String(t.id), title: t.title })));
      const matchingTask = projectTasks.find(t => String(t.id) === String(taskIdValue));
      console.log('🔵 Will bug show?', matchingTask !== undefined, matchingTask ? `Task found: ${matchingTask.title}` : 'Task NOT found');

      // Force a re-render by logging the filtered bugs
      setTimeout(() => {
        const updatedProjectBugs = safeBugs.filter((b) => {
          if (!b || !b.taskId) return false;
          const bugTaskId = String(b.taskId).trim();
          if (!bugTaskId) return false;
          return projectTasks.find(t => String(t.id || '').trim() === bugTaskId) !== undefined;
        });
        console.log('🔵 Updated projectBugs after creation:', updatedProjectBugs.length);
      }, 100);

      setBugFormData({
        title: '',
        description: '',
        taskId: '',
        moduleId: '',
        severity: 'Medium',
        assignedTo: '',
        startDate: '',
        attachments: [],
      });
      setShowAddBugModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Bug Reported!',
        text: `Bug "${bugFormData.title}" reported successfully`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to report bug. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleBugStatusChange = async (bugId, newStatus) => {
    try {
      await updateBug(bugId, { status: newStatus });
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug({ ...selectedBug, status: newStatus });
      }
      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Bug status updated to ${newStatus}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update bug status. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleEditBug = (bug) => {
    setEditingBug(bug);
    setBugFormData({
      title: bug.title,
      description: bug.description || '',
      taskId: (bug.taskId && String(bug.taskId).length > 5) ? bug.taskId : '',
      moduleId: (bug.moduleId && String(bug.moduleId).length > 5) ? bug.moduleId : '',
      severity: bug.severity || 'Medium',
      assignedTo: (bug.assignedTo && String(bug.assignedTo).length > 5) ? bug.assignedTo : '',
      startDate: bug.startDate || '',
      attachments: bug.attachments || [],
    });
    setShowAddBugModal(true);
  };

  const handleUpdateBug = async (e) => {
    e.preventDefault();
    if (!bugFormData.title.trim() || !bugFormData.taskId) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Bug title and task are required',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      // Ensure IDs are strings or undefined (if empty)
      const assignedToValue = bugFormData.assignedTo ? String(bugFormData.assignedTo) : undefined;
      const taskIdValue = String(bugFormData.taskId);

      await updateBug(editingBug.id, {
        ...bugFormData,
        taskId: taskIdValue,
        assignedTo: assignedToValue,
      });

      setEditingBug(null);
      setBugFormData({
        title: '',
        description: '',
        taskId: '',
        moduleId: '',
        severity: 'Medium',
        assignedTo: "",
        startDate: '',
        attachments: [],
      });
      setShowAddBugModal(false);

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: `Bug "${bugFormData.title}" updated successfully`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update bug. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  const handleDeleteBug = async (bugId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await deleteBug(bugId);
        if (selectedBug && selectedBug.id === bugId) {
          setSelectedBug(null);
        }
        Swal.fire(
          'Deleted!',
          'Bug report has been deleted.',
          'success'
        );
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete bug report.',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Module table columns
  const moduleColumns = [
    {
      key: 'name',
      label: 'Module Name',
      render: (row) => (
        <span className="font-semibold text-slate-800">{row.name}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-slate-600 text-sm">{row.description || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const statusColors = {
          Active: 'bg-blue-50 text-blue-600 border-blue-100',
          Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          Planning: 'bg-amber-50 text-amber-600 border-amber-100',
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
      key: 'tasksCount',
      label: viewMode === 'modules-tasks' ? 'Tasks' : 'Bugs',
      render: (row) => {
        if (viewMode === 'modules-tasks') {
          const moduleTasks = projectTasks.filter(t => String(t.moduleId) === String(row.id));
          return <span className="text-slate-600">{moduleTasks.length}</span>;
        } else {
          const moduleTasks = projectTasks.filter(t => String(t.moduleId) === String(row.id));
          const moduleBugs = projectBugs.filter(b => {
            const bugTask = moduleTasks.find(t => String(t.id) === String(b.taskId));
            return bugTask !== undefined;
          });
          return <span className="text-slate-600">{moduleBugs.length}</span>;
        }
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {(currentUser?.role === 'Manager' || currentUser?.role === 'Admin') && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditModule(row);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                title="Edit Module"
              >
                <span className="material-icons text-lg">edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteModule(row.id);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Module"
              >
                <span className="material-icons text-lg">delete</span>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Task table columns
  const taskColumns = [
    {
      key: 'title',
      label: 'Task Title',
      render: (row) => (
        <span className="font-semibold text-slate-800">{row.title}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-slate-600 text-sm">{row.description || '-'}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => {
        const priorityColors = {
          High: 'bg-red-50 text-red-600 border-red-100',
          Medium: 'bg-amber-50 text-amber-600 border-amber-100',
          Low: 'bg-blue-50 text-blue-600 border-blue-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${priorityColors[row.priority] || 'bg-slate-50 text-slate-600 border-slate-100'
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
      render: (row) => {
        const statusColors = {
          Completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
          Pending: 'bg-slate-50 text-slate-600 border-slate-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[row.status] || 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (row) => (
        <span className="text-slate-600">{getAssigneeName(row.assignedTo)}</span>
      ),
    },
    {
      key: 'endDate',
      label: 'Due Date',
      render: (row) => (
        <span className="text-slate-500 text-xs">{row.endDate || '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {(currentUser?.role === 'Manager' || currentUser?.role === 'Admin') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditTask(row);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Edit Task"
            >
              <span className="material-icons text-lg">edit</span>
            </button>
          )}
          {(currentUser?.role === 'Admin') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTask(row.id);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Task"
            >
              <span className="material-icons text-lg">delete</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  // Bug table columns
  const bugColumns = [
    {
      key: 'title',
      label: 'Bug Title',
      render: (row) => (
        <span className="font-semibold text-red-800">{row.title}</span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-slate-600 text-sm">{row.description || '-'}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Severity',
      render: (row) => {
        const severityColors = {
          Critical: 'bg-red-50 text-red-600 border-red-100',
          High: 'bg-orange-50 text-orange-600 border-orange-100',
          Medium: 'bg-amber-50 text-amber-600 border-amber-100',
          Low: 'bg-blue-50 text-blue-600 border-blue-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityColors[row.severity] || 'bg-slate-50 text-slate-600 border-slate-100'
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
      render: (row) => {
        const statusColors = {
          Resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          'In Progress': 'bg-blue-50 text-blue-600 border-blue-100',
          Open: 'bg-red-50 text-red-600 border-red-100',
        };
        return (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[row.status] || 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      key: 'reportedBy',
      label: 'Reported By',
      render: (row) => (
        <span className="text-slate-600">{getAssigneeName(row.reportedBy)}</span>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      render: (row) => (
        <span className="text-slate-600">{getAssigneeName(row.assignedTo)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          {(currentUser?.role === 'Tester' || currentUser?.role === 'Manager' || currentUser?.role === 'Admin') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditBug(row);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Edit Bug"
            >
              <span className="material-icons text-lg">edit</span>
            </button>
          )}
          {(currentUser?.role === 'Admin') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBug(row.id);
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Bug"
            >
              <span className="material-icons text-lg">delete</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  // Form fields
  const moduleFormFields = [
    {
      name: 'name',
      type: 'text',
      label: 'Module Name',
      placeholder: 'E.g. Authentication Module',
      required: true,
      colSpan: 2,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      options: ['Planning', 'Active', 'In Progress', 'Completed'],
      colSpan: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Module description...',
      rows: 3,
      colSpan: 2,
    },
  ];

  const taskFormFields = [
    {
      name: 'title',
      type: 'text',
      label: 'Task Title',
      placeholder: 'E.g. Implement login API',
      required: true,
      colSpan: 2,
    },
    {
      name: 'moduleId',
      type: 'select',
      label: 'Module',
      options: projectModules.map(m => ({ value: m.id, label: m.name })),
      required: true,
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
      required: true,
      colSpan: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Task description...',
      rows: 3,
      colSpan: 2,
    },
    {
      name: 'attachments',
      type: 'file',
      label: 'Attachments',
      placeholder: 'Upload files or screenshots',
      accept: 'image/*,.pdf,.doc,.docx',
      multiple: true,
      colSpan: 2,
    },
  ];

  const bugFormFields = [
    {
      name: 'title',
      type: 'text',
      label: 'Bug Title',
      placeholder: 'E.g. Login button not working',
      required: true,
      colSpan: 2,
    },
    {
      name: 'taskId',
      type: 'select',
      label: 'Task',
      placeholder: 'Select a task...',
      options: projectTasks.map(t => ({ value: String(t.id), label: t.title })),
      required: true,
      colSpan: 1,
    },
    {
      name: 'severity',
      type: 'select',
      label: 'Severity',
      options: ['Low', 'Medium', 'High', 'Critical'],
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
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Detailed bug description...',
      rows: 3,
      colSpan: 2,
    },
    {
      name: 'attachments',
      type: 'file',
      label: 'Screenshots / Attachments',
      placeholder: 'Upload screenshots or files',
      accept: 'image/*,.pdf,.doc,.docx',
      multiple: true,
      colSpan: 2,
    },
  ];

  // Render based on view mode
  console.log('🔵 Current viewMode:', viewMode, 'selectedTask:', selectedTask?.id, 'selectedBug:', selectedBug?.id, 'selectedModule:', selectedModule?.id);

  if (viewMode === 'task-detail' && selectedTask) {
    console.log('🔵 Rendering task detail view');
    const taskBugs = projectBugs.filter(b => String(b.taskId) === String(selectedTask.id));
    return (
      <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} min-h-screen p-4 md:p-6`}>
        <div className={`${componentStyles.card(theme)} mb-6`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <button
                onClick={() => {
                  setViewMode('modules-tasks');
                  setSelectedTask(null);
                }}
                className={`${componentStyles.button.secondary(theme)} flex items-center gap-2 mb-4`}
              >
                <span className="material-icons text-sm">arrow_back</span>
                Back to Tasks
              </button>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme.textPrimary} mb-2`}>
                {selectedTask.title}
              </h1>
              <p className={`${theme.textSecondary} mb-4`}>{selectedTask.description || 'No description'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Priority: </span>
              <span className={componentStyles.badge[selectedTask.priority === 'High' ? 'error' : selectedTask.priority === 'Medium' ? 'warning' : 'primary'](theme)}>
                {selectedTask.priority}
              </span>
            </div>
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Assigned To: </span>
              <span className={theme.textPrimary}>{getAssigneeName(selectedTask.assignedTo)}</span>
            </div>
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Start Date: </span>
              <span className={theme.textPrimary}>{selectedTask.startDate || 'N/A'}</span>
            </div>
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Due Date: </span>
              <span className={theme.textPrimary}>{selectedTask.endDate || 'N/A'}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className={`block ${theme.textMuted} font-semibold mb-2`}>Update Status</label>
            {(currentUser?.role === 'Manager' || currentUser?.role === 'Admin' || String(selectedTask.assignedTo) === String(currentUser?.id)) ? (
              <select
                value={selectedTask.status}
                onChange={(e) => handleTaskStatusChange(selectedTask.id, e.target.value)}
                className={`${componentStyles.input(theme)} w-full md:w-64`}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            ) : (
              <span className={`px-3 py-2 rounded ${selectedTask.status === 'Completed' ? 'bg-green-100 text-green-700' : selectedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                {selectedTask.status}
              </span>
            )}
          </div>

          {taskBugs.length > 0 && (
            <div>
              <h3 className={`text-lg font-bold ${theme.textPrimary} mb-3`}>Related Bugs ({taskBugs.length})</h3>
              <div className="space-y-2">
                {taskBugs.map((bug) => (
                  <div key={bug.id} className={`${theme.containerBgSolid} border ${theme.borderColor} rounded p-3`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`font-medium ${theme.errorText}`}>{bug.title}</span>
                        <span className={componentStyles.badge[bug.severity === 'High' || bug.severity === 'Critical' ? 'error' : bug.severity === 'Medium' ? 'warning' : 'primary'](theme)}>
                          {bug.severity}
                        </span>
                        <span className={componentStyles.badge[bug.status === 'Resolved' ? 'success' : bug.status === 'In Progress' ? 'primary' : 'error'](theme)}>
                          {bug.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'bug-detail' && selectedBug) {
    console.log('🔵 Rendering bug detail view');
    return (
      <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} min-h-screen p-4 md:p-6`}>
        <div className={`${componentStyles.card(theme)} mb-6`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <button
                onClick={() => {
                  setViewMode('modules-bugs');
                  setSelectedBug(null);
                }}
                className={`${componentStyles.button.secondary(theme)} flex items-center gap-2 mb-4`}
              >
                <span className="material-icons text-sm">arrow_back</span>
                Back to Bugs
              </button>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme.errorText} mb-2`}>
                {selectedBug.title}
              </h1>
              <p className={`${theme.textSecondary} mb-4`}>{selectedBug.description || 'No description'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Severity: </span>
              <span className={componentStyles.badge[selectedBug.severity === 'High' || selectedBug.severity === 'Critical' ? 'error' : selectedBug.severity === 'Medium' ? 'warning' : 'primary'](theme)}>
                {selectedBug.severity}
              </span>
            </div>
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Reported By: </span>
              <span className={theme.textPrimary}>{getAssigneeName(selectedBug.reportedBy)}</span>
            </div>
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Assigned To: </span>
              <span className={theme.textPrimary}>{getAssigneeName(selectedBug.assignedTo)}</span>
            </div>
            <div>
              <span className={`${theme.textMuted} font-semibold`}>Reported Date: </span>
              <span className={theme.textPrimary}>{selectedBug.startDate || 'N/A'}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className={`block ${theme.textMuted} font-semibold mb-2`}>Update Status</label>
            {(currentUser?.role === 'Manager' || currentUser?.role === 'Admin' || String(selectedBug.assignedTo) === String(currentUser?.id) || String(selectedBug.reportedBy) === String(currentUser?.id)) ? (
              <select
                value={selectedBug.status}
                onChange={(e) => handleBugStatusChange(selectedBug.id, e.target.value)}
                className={`${componentStyles.input(theme)} w-full md:w-64`}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            ) : (
              <span className={`px-3 py-2 rounded ${selectedBug.status === 'Resolved' ? 'bg-green-100 text-green-700' : selectedBug.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                {selectedBug.status}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Modules view (for tasks or bugs)
  if (viewMode === 'modules-tasks' || viewMode === 'modules-bugs') {
    console.log('🔵 Rendering modules view, selectedModule:', selectedModule?.id);
    const moduleTasks = selectedModule ? projectTasks.filter(t => String(t.moduleId) === String(selectedModule.id)) : [];
    const moduleBugs = selectedModule ? projectBugs.filter(b => {
      const bugTask = moduleTasks.find(t => String(t.id) === String(b.taskId));
      return bugTask !== undefined;
    }) : [];

    console.log('🔵 Module Tasks:', {
      selectedModuleId: selectedModule?.id,
      allProjectTasks: projectTasks.length,
      moduleTasksCount: moduleTasks.length,
      moduleTasks: moduleTasks.map(t => ({ id: t.id, title: t.title, moduleId: t.moduleId }))
    });

    console.log('🔵 Module Bugs:', {
      moduleTasksCount: moduleTasks.length,
      moduleBugsCount: moduleBugs.length,
      moduleBugs: moduleBugs.map(b => ({ id: b.id, title: b.title, taskId: b.taskId }))
    });

    if (selectedModule) {
      // Show tasks or bugs for selected module
      return (
        <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} h-full p-4 md:p-6 flex flex-col`}>
          <div className={`${componentStyles.card(theme)} flex-1 min-h-0 flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <button
                  onClick={() => {
                    setSelectedModule(null);
                  }}
                  className={`${componentStyles.button.secondary(theme)} flex items-center gap-2 mb-4`}
                >
                  <span className="material-icons text-sm">arrow_back</span>
                  Back to Modules
                </button>
                <h2 className={`text-xl font-bold ${theme.textPrimary}`}>
                  {selectedModule.name} - {viewMode === 'modules-tasks' ? 'Tasks' : 'Bugs'}
                </h2>
              </div>
              {viewMode === 'modules-tasks' && (currentUser?.role === 'Manager' || currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
                <button
                  onClick={() => {
                    setTaskFormData(prev => ({ ...prev, moduleId: selectedModule.id }));
                    setShowAddTaskModal(true);
                  }}
                  className={`${componentStyles.button.primary(theme)} flex items-center gap-2`}
                >
                  <span className="material-icons text-sm">add</span>
                  Add Task
                </button>
              )}
              {viewMode === 'modules-bugs' && (currentUser?.role === 'Tester' || currentUser?.role === 'Manager' || currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
                <button
                  onClick={() => {
                    setBugFormData(prev => ({ ...prev, moduleId: selectedModule.id }));
                    setShowAddBugModal(true);
                  }}
                  className={`${componentStyles.button.error(theme)} flex items-center gap-2`}
                >
                  <span className="material-icons text-sm">bug_report</span>
                  Report Bug
                </button>
              )}
            </div>

            {/* Task Form Modal */}
            {viewMode === 'modules-tasks' && showAddTaskModal && (
              <DynamicForm
                fields={taskFormFields}
                formData={taskFormData}
                onChange={(name, value) => setTaskFormData(prev => ({ ...prev, [name]: value }))}
                onSubmit={editingTask ? handleUpdateTask : handleAddTask}
                onCancel={() => {
                  setShowAddTaskModal(false);
                  setEditingTask(null);
                  setTaskFormData({
                    title: '',
                    description: '',
                    moduleId: '',
                    assignedTo: currentUser?.id || 1,
                    priority: 'Medium',
                    startDate: '',
                    endDate: '',
                    attachments: [],
                  });
                }}
                title={editingTask ? 'Edit Task' : 'Add New Task'}
                submitLabel={editingTask ? 'Update Task' : 'Create Task'}
                icon={editingTask ? 'edit' : 'task_alt'}
                iconColor="indigo"
                gridCols={2}
              />
            )}

            {/* Bug Form Modal */}
            {viewMode === 'modules-bugs' && showAddBugModal && (
              <DynamicForm
                fields={bugFormFields}
                formData={bugFormData}
                onChange={(name, value) => setBugFormData(prev => ({ ...prev, [name]: value }))}
                onSubmit={editingBug ? handleUpdateBug : handleAddBug}
                onCancel={() => {
                  setShowAddBugModal(false);
                  setEditingBug(null);
                  setBugFormData({
                    title: '',
                    description: '',
                    taskId: '',
                    moduleId: '',
                    severity: 'Medium',
                    assignedTo: '',
                    startDate: '',
                    attachments: [],
                  });
                }}
                title={editingBug ? 'Edit Bug Report' : 'Report Bug'}
                submitLabel={editingBug ? 'Update Bug' : 'Report Bug'}
                icon={editingBug ? 'edit' : 'bug_report'}
                iconColor="red"
                gridCols={2}
              />
            )}

            {viewMode === 'modules-tasks' ? (
              <div className="flex-1 min-h-0">
                <DynamicTable
                  data={moduleTasks}
                  columns={taskColumns}
                  onRowClick={(row) => {
                    setSelectedTask(row);
                    setViewMode('task-detail');
                  }}
                  emptyMessage="No tasks in this module"
                  emptySubMessage="Add a task to get started"
                  emptyIcon="task_alt"
                />
              </div>
            ) : (
              <div className="flex-1 min-h-0">
                <DynamicTable
                  data={moduleBugs}
                  columns={bugColumns}
                  onRowClick={(row) => {
                    setSelectedBug(row);
                    setViewMode('bug-detail');
                  }}
                  emptyMessage="No bugs reported for this module"
                  emptySubMessage="Report a bug to get started"
                  emptyIcon="bug_report"
                />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Show modules table
      return (
        <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} h-full p-4 md:p-6 flex flex-col`}>
          <div className={`${componentStyles.card(theme)} flex-1 min-h-0 flex flex-col`}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <button
                  onClick={() => setViewMode('project')}
                  className={`${componentStyles.button.secondary(theme)} flex items-center gap-2 mb-4`}
                >
                  <span className="material-icons text-sm">arrow_back</span>
                  Back to Project
                </button>
                <h2 className={`text-xl font-bold ${theme.textPrimary}`}>
                  Modules - {viewMode === 'modules-tasks' ? 'Tasks' : 'Bugs'}
                </h2>
              </div>
              {(currentUser?.role === 'Manager' || currentUser?.role === 'Admin') && (
                <button
                  onClick={() => {
                    setEditingModule(null);
                    setModuleFormData({ name: '', description: '', status: 'Planning' });
                    setShowAddModuleModal(true);
                  }}
                  className={`${componentStyles.button.primary(theme)} flex items-center gap-2`}
                >
                  <span className="material-icons text-sm">add</span>
                  Add Module
                </button>
              )}
            </div>

            {/* Module Form Modal */}
            {showAddModuleModal && (
              <DynamicForm
                fields={moduleFormFields}
                formData={moduleFormData}
                onChange={(name, value) => setModuleFormData(prev => ({ ...prev, [name]: value }))}
                onSubmit={editingModule ? handleUpdateModule : handleAddModule}
                onCancel={() => {
                  setShowAddModuleModal(false);
                  setEditingModule(null);
                  setModuleFormData({ name: '', description: '', status: 'Planning' });
                }}
                title={editingModule ? 'Edit Module' : 'Add New Module'}
                submitLabel={editingModule ? 'Update Module' : 'Create Module'}
                icon={editingModule ? 'edit' : 'add'}
                iconColor="purple"
                gridCols={2}
              />
            )}

            <div className="flex-1 min-h-0">
              <DynamicTable
                data={projectModules}
                columns={moduleColumns}
                onRowClick={(row) => {
                  setSelectedModule(row);
                }}
                emptyMessage="No modules created yet"
                emptySubMessage="Add a module to get started"
                emptyIcon="view_module"
              />
            </div>
          </div>
        </div>
      );
    }
  }

  // Project view (default)
  console.log('🔵 Rendering project view for:', project?.title);
  console.log('🔵 Current user role:', currentUser?.role);
  console.log('🔵 View mode:', viewMode);
  console.log('🔵 Project data:', project);
  console.log('🔵 Theme:', theme);
  console.log('🔵 componentStyles:', componentStyles);

  // Safety check - if project is still null somehow, show error
  if (!project) {
    console.error('🔵 Project is null in render!');
    return (
      <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} min-h-screen p-4 md:p-6 flex items-center justify-center`}>
        <div className={`${componentStyles.card(theme)} text-center max-w-md`}>
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Project Not Found</h2>
          <p className={`${theme.textSecondary} mb-4`}>Project ID: {id}</p>
          <Link
            to="/projects"
            className={`${componentStyles.button.primary(theme)} inline-flex items-center gap-2`}
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDarkMode ? theme.background : 'bg-gray-50'} min-h-screen p-4 md:p-6`}>
      {/* Project Header */}
      <div className={`${componentStyles.card(theme)} mb-6`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <Link
              to="/projects"
              className={`${componentStyles.button.secondary(theme)} flex items-center gap-2 mb-4 inline-flex`}
            >
              <span className="material-icons text-sm">arrow_back</span>
              Back to Projects
            </Link>
            <h1 className={`text-2xl md:text-3xl font-bold ${theme.textPrimary} mb-2`}>
              {project?.title || 'Untitled Project'}
            </h1>
            <p className={`${theme.textSecondary} mb-4`}>{project?.description || 'No description'}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className={`${theme.textMuted} font-semibold`}>Status: </span>
                <span className={componentStyles.badge[project.status === 'Active' ? 'primary' : project.status === 'Completed' ? 'success' : 'warning'](theme)}>
                  {project.status}
                </span>
              </div>
              <div>
                <span className={`${theme.textMuted} font-semibold`}>Assigned Developer: </span>
                <span className={theme.textPrimary}>{getDeveloperName(project.assignedDeveloperId)}</span>
              </div>
              <div>
                <span className={`${theme.textMuted} font-semibold`}>Manager: </span>
                <span className={theme.textPrimary}>{getAssigneeName(project.managerId)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
          {/* Modules Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-violet-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                <span className="material-icons text-violet-600 dark:text-violet-400">view_module</span>
              </div>
              <h3 className={`font-bold ${theme.textPrimary}`}>Modules</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`text-xl font-bold ${theme.textPrimary}`}>{projectModules.length}</div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">Total</div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {projectModules.filter(m => m.status === 'Completed').length}
                </div>
                <div className="text-[10px] uppercase text-emerald-600/70 font-bold">Done</div>
              </div>
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {projectModules.length - projectModules.filter(m => m.status === 'Completed').length}
                </div>
                <div className="text-[10px] uppercase text-amber-600/70 font-bold">Pending</div>
              </div>
            </div>
          </div>

          {/* Tasks Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-blue-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="material-icons text-blue-600 dark:text-blue-400">task_alt</span>
              </div>
              <h3 className={`font-bold ${theme.textPrimary}`}>Tasks</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`text-xl font-bold ${theme.textPrimary}`}>{projectTasks.length}</div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">Total</div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {projectTasks.filter(t => t.status === 'Completed').length}
                </div>
                <div className="text-[10px] uppercase text-emerald-600/70 font-bold">Done</div>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {projectTasks.filter(t => t.status !== 'Completed').length}
                </div>
                <div className="text-[10px] uppercase text-blue-600/70 font-bold">Pending</div>
              </div>
            </div>
          </div>

          {/* Bugs Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-rose-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <span className="material-icons text-rose-600 dark:text-rose-400">bug_report</span>
              </div>
              <h3 className={`font-bold ${theme.textPrimary}`}>Bugs</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`text-xl font-bold ${theme.textPrimary}`}>{projectBugs.length}</div>
                <div className="text-[10px] uppercase text-slate-500 font-bold">Total</div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {projectBugs.filter(b => b.status === 'Resolved').length}
                </div>
                <div className="text-[10px] uppercase text-emerald-600/70 font-bold">Fixed</div>
              </div>
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                  {projectBugs.filter(b => b.status !== 'Resolved').length}
                </div>
                <div className="text-[10px] uppercase text-rose-600/70 font-bold">Open</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          {(currentUser?.role === 'Developer' || currentUser?.role === 'Manager' || currentUser?.role === 'Admin') && (
            <button
              onClick={() => {
                setViewMode('modules-tasks');
                setSelectedModule(null);
              }}
              className={`${componentStyles.button.primary(theme)} flex items-center gap-2 px-6 py-3 text-lg`}
            >
              <span className="material-icons">task_alt</span>
              View Tasks
            </button>
          )}
          {(currentUser?.role === 'Tester' || currentUser?.role === 'Manager' || currentUser?.role === 'Admin' || currentUser?.role === 'Developer') && (
            <button
              onClick={() => {
                setViewMode('modules-bugs');
                setSelectedModule(null);
              }}
              className={`${componentStyles.button.error(theme)} flex items-center gap-2 px-6 py-3 text-lg`}
            >
              <span className="material-icons">bug_report</span>
              Report Bugs
            </button>
          )}
        </div>
      </div>

      {/* Module Form Modal */}
      {showAddModuleModal && (
        <DynamicForm
          fields={moduleFormFields}
          formData={moduleFormData}
          onChange={(name, value) => setModuleFormData(prev => ({ ...prev, [name]: value }))}
          onSubmit={editingModule ? handleUpdateModule : handleAddModule}
          onCancel={() => {
            setShowAddModuleModal(false);
            setEditingModule(null);
            setModuleFormData({ name: '', description: '', status: 'Planning' });
          }}
          title={editingModule ? 'Edit Module' : 'Add New Module'}
          submitLabel={editingModule ? 'Update Module' : 'Create Module'}
          icon={editingModule ? 'edit' : 'add'}
          iconColor="purple"
          gridCols={2}
        />
      )}

      {/* Task Form Modal */}
      {showAddTaskModal && (
        <DynamicForm
          fields={taskFormFields}
          formData={taskFormData}
          onChange={(name, value) => setTaskFormData(prev => ({ ...prev, [name]: value }))}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={() => {
            setShowAddTaskModal(false);
            setEditingTask(null);
            setTaskFormData({
              title: '',
              description: '',
              moduleId: '',
              assignedTo: currentUser?.id || 1,
              priority: 'Medium',
              startDate: '',
              endDate: '',
              attachments: [],
            });
          }}
          title={editingTask ? 'Edit Task' : 'Add New Task'}
          submitLabel={editingTask ? 'Update Task' : 'Create Task'}
          icon={editingTask ? 'edit' : 'task_alt'}
          iconColor="indigo"
          gridCols={2}
        />
      )}

      {/* Bug Form Modal */}
      {showAddBugModal && (
        <DynamicForm
          fields={bugFormFields}
          formData={bugFormData}
          onChange={(name, value) => setBugFormData(prev => ({ ...prev, [name]: value }))}
          onSubmit={editingBug ? handleUpdateBug : handleAddBug}
          onCancel={() => {
            setShowAddBugModal(false);
            setEditingBug(null);
            setBugFormData({
              title: '',
              description: '',
              taskId: '',
              moduleId: '',
              severity: 'Medium',
              assignedTo: '',
              startDate: '',
              attachments: [],
            });
          }}
          title={editingBug ? 'Edit Bug Report' : 'Report Bug'}
          submitLabel={editingBug ? 'Update Bug' : 'Report Bug'}
          icon={editingBug ? 'edit' : 'bug_report'}
          iconColor="red"
          gridCols={2}
        />
      )}
    </div>
  );
};

export default ProjectDetailsController;
