import axios from 'axios';

const client = axios.create({
    baseURL: 'https://bugtrackerbackend-2iui.onrender.com',
});

// Helper to validate MongoDB Object IDs
const isValidObjectId = (id) => {
    if (!id) return false;
    const sId = String(id).trim();
    return sId.length === 24 && /^[0-9a-fA-F]+$/.test(sId);
};

// Add interceptor to inject the token
client.interceptors.request.use((config) => {
    const storedUser = sessionStorage.getItem('tracker_user');
    if (storedUser) {
        try {
            const parsed = JSON.parse(storedUser);
            // Handle both normalized { token: ... } and raw { data: { token: ... } }
            const token = parsed.token || (parsed.data && parsed.data.token);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.error("Error parsing user token for api header", e);
        }
    }
    return config;
});

// Add response interceptor for debugging and error handling
client.interceptors.response.use(
    response => response,
    error => {

        // Log other errors
        console.error('[API Error]', error.response?.status, error.response?.data || error.message);
        if (error.code === "ERR_NETWORK") {
            alert("Cannot connect to server. Please ensure the backend server is running on port 5000.");
        }
        return Promise.reject(error);
    }
);


const api = {
    // Dashboard
    getDashboardStats: async () => {
        const response = await client.get('/api/dashboard/stats');
        return response.data;
    },
    getTeamWorkload: async () => {
        const response = await client.get('/api/dashboard/workload');
        return response.data;
    },

    // Projects
    getProjects: async () => {
        const response = await client.get('/api/projects');
        // API returns: { message: "...", count: number, projects: [...] }
        const projects = response.data.projects || response.data || [];

        // Normalize project data to match frontend expectations
        return projects.map(project => {
            // Map status from API format (IN_PROGRESS) to frontend format (In Progress)
            const statusMap = {
                'IN_PROGRESS': 'In Progress',
                'PLANNING': 'Planning',
                'ACTIVE': 'Active',
                'COMPLETED': 'Completed',
                'ON_HOLD': 'On Hold',
            };

            const normalizedStatus = statusMap[project.status] || project.status || 'Planning';

            // Get assigned developer ID (first developer from array, or null)
            const assignedDeveloperId = project.assignedDevelopers && project.assignedDevelopers.length > 0
                ? (project.assignedDevelopers[0]._id || project.assignedDevelopers[0].id)
                : null;

            // Extract manager ID from createdBy
            const managerId = project.createdBy?._id || project.createdBy?.id || project.managerId;

            // Convert createdAt to startDate if available, otherwise use empty string
            const startDate = project.startDate || (project.createdAt ? new Date(project.createdAt).toISOString().split('T')[0] : '');

            return {
                id: project._id || project.id,
                title: project.name || project.title,
                description: project.description || '',
                status: normalizedStatus,
                managerId: managerId,
                assignedDeveloperId: assignedDeveloperId,
                startDate: startDate,
                endDate: project.endDate || '',
                // Keep original API fields for reference
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                createdBy: project.createdBy,
                assignedDevelopers: project.assignedDevelopers || [],
            };
        });
    },
    getProject: async (id) => {
        // Ensure ID is converted to string for the API endpoint
        // Example: GET /api/projects/69536cc37d97007442525198
        const projectId = String(id);

        try {
            const response = await client.get(`/api/projects/${projectId}`);

            console.log('[API] getProject response:', response.data);

            // Normalize single project data (same normalization as getProjects)
            // API might return: { project: {...} } or just {...}
            const project = response.data.project || response.data;

            if (!project) {
                console.error('[API] getProject: No project data in response', response.data);
                throw new Error('Project data not found in API response');
            }

            // Map status from API format to frontend format
            const statusMap = {
                'IN_PROGRESS': 'In Progress',
                'PLANNING': 'Planning',
                'ACTIVE': 'Active',
                'COMPLETED': 'Completed',
                'ON_HOLD': 'On Hold',
            };

            const normalizedStatus = statusMap[project.status] || project.status || 'Planning';

            // Get assigned developer ID (first developer from array, or null)
            const assignedDeveloperId = project.assignedDevelopers && project.assignedDevelopers.length > 0
                ? (project.assignedDevelopers[0]._id || project.assignedDevelopers[0].id)
                : null;

            // Extract manager ID from createdBy
            const managerId = project.createdBy?._id || project.createdBy?.id || project.managerId;

            // Convert createdAt to startDate if available, otherwise use empty string
            const startDate = project.startDate || (project.createdAt ? new Date(project.createdAt).toISOString().split('T')[0] : '');

            const normalizedProject = {
                id: project._id || project.id,
                title: project.name || project.title,
                description: project.description || '',
                status: normalizedStatus,
                managerId: managerId,
                assignedDeveloperId: assignedDeveloperId,
                startDate: startDate,
                endDate: project.endDate || '',
                // Keep original API fields for reference
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                createdBy: project.createdBy,
                assignedDevelopers: project.assignedDevelopers || [],
            };

            console.log('[API] getProject normalized:', normalizedProject);

            return normalizedProject;
        } catch (error) {
            console.error('[API] getProject error:', error);
            // Re-throw with more context
            if (error.response) {
                throw new Error(`Failed to fetch project: ${error.response.status} ${error.response.statusText}`);
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Failed to fetch project: Unknown error');
            }
        }
    },
    createProject: async (project) => {
        // Transform frontend format to API format
        // Frontend uses: { title, description, status, assignedDeveloperId, startDate, endDate }
        // API expects: { name, description, status, assignedDevelopers, ... }

        // Map status from frontend format to API format
        const statusMap = {
            'In Progress': 'IN_PROGRESS',
            'Planning': 'PLANNING',
            'Active': 'ACTIVE',
            'Completed': 'COMPLETED',
            'On Hold': 'ON_HOLD',
        };

        const apiStatus = statusMap[project.status] || project.status || 'PLANNING';

        // Build API request payload
        const apiPayload = {
            name: project.title || project.name,
            description: project.description || '',
            status: apiStatus,
        };

        // Add assignedDevelopers array if assignedDeveloperId is provided and valid
        if (project.assignedDeveloperId && isValidObjectId(project.assignedDeveloperId)) {
            apiPayload.assignedDevelopers = [project.assignedDeveloperId];
        }

        // Add dates if provided
        if (project.startDate) {
            apiPayload.startDate = project.startDate;
        }
        if (project.endDate) {
            apiPayload.endDate = project.endDate;
        }

        const response = await client.post('/api/projects', apiPayload);

        // Normalize the response (same as getProject)
        const createdProject = response.data.project || response.data;

        // Map status back to frontend format
        const frontendStatusMap = {
            'IN_PROGRESS': 'In Progress',
            'PLANNING': 'Planning',
            'ACTIVE': 'Active',
            'COMPLETED': 'Completed',
            'ON_HOLD': 'On Hold',
        };

        const normalizedStatus = frontendStatusMap[createdProject.status] || createdProject.status || 'Planning';

        // Get assigned developer ID (first developer from array, or null)
        const assignedDeveloperId = createdProject.assignedDevelopers && createdProject.assignedDevelopers.length > 0
            ? (createdProject.assignedDevelopers[0]._id || createdProject.assignedDevelopers[0].id)
            : null;

        // Extract manager ID from createdBy
        const managerId = createdProject.createdBy?._id || createdProject.createdBy?.id || createdProject.managerId;

        // Convert createdAt to startDate if available
        const startDate = createdProject.startDate || (createdProject.createdAt ? new Date(createdProject.createdAt).toISOString().split('T')[0] : '');

        return {
            id: createdProject._id || createdProject.id,
            title: createdProject.name || createdProject.title,
            description: createdProject.description || '',
            status: normalizedStatus,
            managerId: managerId,
            assignedDeveloperId: assignedDeveloperId,
            startDate: startDate,
            endDate: createdProject.endDate || '',
            createdAt: createdProject.createdAt,
            updatedAt: createdProject.updatedAt,
            createdBy: createdProject.createdBy,
            assignedDevelopers: createdProject.assignedDevelopers || [],
        };
    },
    updateProject: async (id, updates) => {
        // Ensure ID is converted to string for the API endpoint
        const projectId = String(id);

        // Transform updates to API format (ensure IDs are valid)
        const apiUpdates = { ...updates };
        if (apiUpdates.assignedDeveloperId) {
            if (isValidObjectId(apiUpdates.assignedDeveloperId)) {
                apiUpdates.assignedDevelopers = [apiUpdates.assignedDeveloperId];
            }
            delete apiUpdates.assignedDeveloperId;
        }

        const response = await client.put(`/api/projects/${projectId}`, apiUpdates);
        return response.data;
    },
    deleteProject: async (id) => {
        // Ensure ID is converted to string for the API endpoint
        // Example: DELETE /api/projects/69536cc37d97007442525198
        const projectId = String(id);
        const response = await client.delete(`/api/projects/${projectId}`);
        return response.data;
    },

    // Tasks
    getTasks: async () => {
        const response = await client.get('/api/tasks');
        // API might return array directly or wrapped in object
        let tasks = [];
        if (Array.isArray(response.data)) {
            tasks = response.data;
        } else if (response.data && Array.isArray(response.data.tasks)) {
            tasks = response.data.tasks;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            tasks = response.data.data;
        }

        console.log('[API] getTasks response:', {
            rawData: response.data,
            tasksCount: tasks.length,
            firstTask: tasks[0]
        });

        // Normalize each task to match frontend expectations
        return tasks.map(task => {
            // Extract assignedTo ID from object (API returns assignedTo as object with _id, name, email, avatar)
            const assignedToId = task.assignedTo?._id || task.assignedTo?.id || task.assignedTo;

            // Normalize dates from ISO format to YYYY-MM-DD
            const normalizeDate = (dateString) => {
                if (!dateString) return '';
                try {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                } catch (e) {
                    return dateString;
                }
            };

            return {
                id: task._id || task.id,
                projectId: task.projectId,
                moduleId: task.moduleId,
                title: task.title,
                description: task.description || '',
                assignedTo: assignedToId,
                status: task.status || 'Pending',
                priority: task.priority || 'Medium',
                startDate: normalizeDate(task.startDate),
                endDate: normalizeDate(task.endDate),
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                // Keep original assignedTo object for reference if needed
                assignedToUser: task.assignedTo,
            };
        });
    },
    createTask: async (task) => {
        // Transform frontend format to API format
        // Ensure IDs are strings and valid ObjectIds
        const apiPayload = {
            projectId: isValidObjectId(task.projectId) ? String(task.projectId) : String(task.projectId),
            moduleId: isValidObjectId(task.moduleId) ? String(task.moduleId) : undefined,
            title: task.title,
            description: task.description || '',
            assignedTo: isValidObjectId(task.assignedTo) ? String(task.assignedTo) : undefined,
            status: task.status || 'Pending',
            priority: task.priority || 'Medium',
            startDate: task.startDate || undefined,
            endDate: task.endDate || undefined,
        };

        const response = await client.post('/api/tasks', apiPayload);

        // Normalize response (same as getTasks)
        const createdTask = response.data;
        const assignedToId = createdTask.assignedTo?._id || createdTask.assignedTo?.id || createdTask.assignedTo;

        const normalizeDate = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            } catch (e) {
                return dateString;
            }
        };

        return {
            id: createdTask._id || createdTask.id,
            projectId: createdTask.projectId,
            moduleId: createdTask.moduleId,
            title: createdTask.title,
            description: createdTask.description || '',
            assignedTo: assignedToId,
            status: createdTask.status || 'Pending',
            priority: createdTask.priority || 'Medium',
            startDate: normalizeDate(createdTask.startDate),
            endDate: normalizeDate(createdTask.endDate),
            createdAt: createdTask.createdAt,
            updatedAt: createdTask.updatedAt,
            assignedToUser: createdTask.assignedTo,
        };
    },
    updateTask: async (id, updates) => {
        // Ensure task ID is converted to string
        const taskId = String(id);

        // Transform updates to API format (ensure IDs are valid)
        const apiUpdates = { ...updates };
        if (apiUpdates.projectId) apiUpdates.projectId = isValidObjectId(apiUpdates.projectId) ? String(apiUpdates.projectId) : String(apiUpdates.projectId);
        if (apiUpdates.moduleId) apiUpdates.moduleId = isValidObjectId(apiUpdates.moduleId) ? String(apiUpdates.moduleId) : undefined;
        if (apiUpdates.assignedTo) apiUpdates.assignedTo = isValidObjectId(apiUpdates.assignedTo) ? String(apiUpdates.assignedTo) : undefined;

        const response = await client.put(`/api/tasks/${taskId}`, apiUpdates);

        // Normalize response (same as getTasks)
        const updatedTask = response.data;
        const assignedToId = updatedTask.assignedTo?._id || updatedTask.assignedTo?.id || updatedTask.assignedTo;

        const normalizeDate = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            } catch (e) {
                return dateString;
            }
        };

        return {
            id: updatedTask._id || updatedTask.id || taskId,
            projectId: updatedTask.projectId,
            moduleId: updatedTask.moduleId,
            title: updatedTask.title,
            description: updatedTask.description || '',
            assignedTo: assignedToId,
            status: updatedTask.status || 'Pending',
            priority: updatedTask.priority || 'Medium',
            startDate: normalizeDate(updatedTask.startDate),
            endDate: normalizeDate(updatedTask.endDate),
            createdAt: updatedTask.createdAt,
            updatedAt: updatedTask.updatedAt,
            assignedToUser: updatedTask.assignedTo,
        };
    },
    deleteTask: async (id) => {
        // Ensure task ID is converted to string
        const taskId = String(id);
        const response = await client.delete(`/api/tasks/${taskId}`);
        return response.data;
    },

    // Modules
    getModules: async (projectId) => {
        // Ensure projectId is converted to string
        const projId = String(projectId);
        const response = await client.get(`/api/projects/${projId}/modules`);

        // Normalize modules array response
        const modules = Array.isArray(response.data) ? response.data : (response.data.modules || []);

        return modules.map(module => ({
            id: module._id || module.id,
            projectId: module.projectId || projId,
            name: module.name,
            description: module.description || '',
            status: module.status || 'Planning',
            createdAt: module.createdAt,
            updatedAt: module.updatedAt,
        }));
    },
    createModule: async (projectId, module) => {
        // Ensure projectId is converted to string
        const projId = String(projectId);

        // Send module data to API
        // API expects: { name, description, status }
        const response = await client.post(`/api/projects/${projId}/modules`, {
            name: module.name,
            description: module.description || '',
            status: module.status || 'Planning',
        });

        // Normalize response to match frontend expectations
        const createdModule = response.data;

        return {
            id: createdModule._id || createdModule.id,
            projectId: createdModule.projectId || projId,
            name: createdModule.name,
            description: createdModule.description || '',
            status: createdModule.status || 'Planning',
            createdAt: createdModule.createdAt,
            updatedAt: createdModule.updatedAt,
        };
    },
    updateModule: async (projectId, moduleId, updates) => {
        // Ensure IDs are converted to strings
        const projId = String(projectId);
        const modId = String(moduleId);

        const response = await client.put(`/api/projects/${projId}/modules/${modId}`, updates);

        // Normalize response
        const updatedModule = response.data;

        return {
            id: updatedModule._id || updatedModule.id || modId,
            projectId: updatedModule.projectId || projId,
            name: updatedModule.name,
            description: updatedModule.description || '',
            status: updatedModule.status || 'Planning',
            createdAt: updatedModule.createdAt,
            updatedAt: updatedModule.updatedAt,
        };
    },
    deleteModule: async (projectId, moduleId) => {
        // Ensure IDs are converted to strings
        const projId = String(projectId);
        const modId = String(moduleId);

        const response = await client.delete(`/api/projects/${projId}/modules/${modId}`);
        return response.data;
    },

    // Bugs
    getBugs: async () => {
        const response = await client.get('/api/bugs');
        // API might return array directly or wrapped in object
        let bugs = [];
        if (Array.isArray(response.data)) {
            bugs = response.data;
        } else if (response.data && Array.isArray(response.data.bugs)) {
            bugs = response.data.bugs;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            bugs = response.data.data;
        }

        console.log('[API] getBugs response:', {
            rawData: response.data,
            bugsCount: bugs.length,
            firstBug: bugs[0]
        });

        // Normalize each bug to match frontend expectations
        return bugs.map(bug => {
            // Extract assignedTo ID from object (if API returns assignedTo as object)
            const assignedToId = bug.assignedTo?._id || bug.assignedTo?.id || bug.assignedTo;

            // Extract reportedBy ID from object (if API returns reportedBy as object)
            const reportedById = bug.reportedBy?._id || bug.reportedBy?.id || bug.reportedBy;

            // Normalize dates from ISO format to YYYY-MM-DD
            const normalizeDate = (dateString) => {
                if (!dateString) return '';
                try {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                } catch (e) {
                    return dateString;
                }
            };

            // Extract taskId from object (if API returns taskId as object)
            const taskIdObj = bug.taskId; // Keep raw
            const taskId = taskIdObj?._id || taskIdObj?.id || taskIdObj;

            return {
                id: bug._id || bug.id,
                taskId: String(taskId || ''), // Ensure taskId is always a string
                title: bug.title,
                description: bug.description || '',
                severity: bug.severity || 'Medium',
                assignedTo: assignedToId,
                reportedBy: reportedById,
                status: bug.status || 'Open',
                startDate: normalizeDate(bug.startDate),
                endDate: normalizeDate(bug.endDate),
                attachments: bug.attachments || [],
                createdAt: bug.createdAt,
                updatedAt: bug.updatedAt,
            };
        });
    },
    createBug: async (bug) => {
        // Transform frontend format to API format
        // Ensure IDs are strings and valid ObjectIds
        const apiPayload = {
            taskId: String(bug.taskId),
            title: bug.title,
            description: bug.description || '',
            severity: bug.severity || 'Medium',
            status: bug.status || 'Open',
            assignedTo: isValidObjectId(bug.assignedTo) ? String(bug.assignedTo) : undefined,
            reportedBy: isValidObjectId(bug.reportedBy) ? String(bug.reportedBy) : undefined,
            attachments: bug.attachments || [],
            startDate: bug.startDate || undefined,
            endDate: bug.endDate || undefined,
        };

        console.log('🔵 [API] createBug payload:', apiPayload);
        const response = await client.post('/api/bugs', apiPayload);

        // Normalize response (same as getBugs)
        const createdBug = response.data;

        // Extract assignedTo ID from object (if API returns assignedTo as object)
        const assignedToId = createdBug.assignedTo?._id || createdBug.assignedTo?.id || createdBug.assignedTo;

        // Extract reportedBy ID from object (if API returns reportedBy as object)
        const reportedById = createdBug.reportedBy?._id || createdBug.reportedBy?.id || createdBug.reportedBy;

        // Normalize dates from ISO format to YYYY-MM-DD
        const normalizeDate = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            } catch (e) {
                return dateString;
            }
        };

        return {
            id: createdBug._id || createdBug.id,
            taskId: createdBug.taskId,
            title: createdBug.title,
            description: createdBug.description || '',
            severity: createdBug.severity || 'Medium',
            assignedTo: assignedToId,
            reportedBy: reportedById,
            status: createdBug.status || 'Open',
            startDate: normalizeDate(createdBug.startDate),
            endDate: normalizeDate(createdBug.endDate),
            attachments: createdBug.attachments || [],
            createdAt: createdBug.createdAt,
            updatedAt: createdBug.updatedAt,
        };
    },
    updateBug: async (id, updates) => {
        // Ensure bug ID is converted to string
        const bugId = String(id);

        // Transform updates to API format (convert IDs to strings)
        const apiUpdates = { ...updates };
        if (apiUpdates.taskId) apiUpdates.taskId = isValidObjectId(apiUpdates.taskId) ? String(apiUpdates.taskId) : undefined;
        if (apiUpdates.assignedTo) apiUpdates.assignedTo = isValidObjectId(apiUpdates.assignedTo) ? String(apiUpdates.assignedTo) : undefined;
        if (apiUpdates.reportedBy) apiUpdates.reportedBy = isValidObjectId(apiUpdates.reportedBy) ? String(apiUpdates.reportedBy) : undefined;

        const response = await client.put(`/api/bugs/${bugId}`, apiUpdates);

        // Normalize response (same as getBugs)
        const updatedBug = response.data;

        // Extract assignedTo ID from object (if API returns assignedTo as object)
        const assignedToId = updatedBug.assignedTo?._id || updatedBug.assignedTo?.id || updatedBug.assignedTo;

        // Extract reportedBy ID from object (if API returns reportedBy as object)
        const reportedById = updatedBug.reportedBy?._id || updatedBug.reportedBy?.id || updatedBug.reportedBy;

        // Normalize dates from ISO format to YYYY-MM-DD
        const normalizeDate = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            } catch (e) {
                return dateString;
            }
        };

        return {
            id: updatedBug._id || updatedBug.id || bugId,
            taskId: String(updatedBug.taskId || ''), // Ensure taskId is always a string
            title: updatedBug.title,
            description: updatedBug.description || '',
            severity: updatedBug.severity || 'Medium',
            assignedTo: assignedToId,
            reportedBy: reportedById,
            status: updatedBug.status || 'Open',
            startDate: normalizeDate(updatedBug.startDate),
            endDate: normalizeDate(updatedBug.endDate),
            attachments: updatedBug.attachments || [],
            createdAt: updatedBug.createdAt,
            updatedAt: updatedBug.updatedAt,
        };
    },
    deleteBug: async (id) => {
        // Ensure bug ID is converted to string
        const bugId = String(id);
        const response = await client.delete(`/api/bugs/${bugId}`);
        return response.data;
    },

    // Users
    getUsers: async () => {
        const response = await client.get('/api/users');
        return response.data;
    },
    createUser: async (user) => {
        const response = await client.post('/api/users', user);
        return response.data.user || response.data;
    },
    updateUser: async (id, updates) => {
        // Example: PUT /api/users/694fb9e78bc84e4a86e8d55a
        if (!id || id === 'undefined' || id === 'null') {
            throw new Error('User ID is required for update operation');
        }
        const userId = String(id);
        const response = await client.put(`/api/users/${userId}`, updates);
        return response.data;
    },
    deleteUser: async (id) => {
        // Example: DELETE /api/users/694fb9e78bc84e4a86e8d55a
        if (!id || id === 'undefined' || id === 'null') {
            throw new Error('User ID is required for delete operation');
        }
        const userId = String(id);
        const response = await client.delete(`/api/users/${userId}`);
        return response.data;
    },
    getUserStatistics: async (id) => {
        // Ensure ID is converted to string for the API endpoint
        const userId = String(id);
        const response = await client.get(`/api/users/${userId}/statistics`);
        return response.data;
    },
    login: async (email, password) => {
        const response = await client.post('/api/auth/login', { email, password });
        return response.data;
    }
};

export default api;
