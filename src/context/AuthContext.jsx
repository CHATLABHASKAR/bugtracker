import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Load user from sessionStorage on mount (lazy initialization)
    const [user, setUser] = useState(() => {
        const storedUser = sessionStorage.getItem('tracker_user');
        console.log('[AuthContext] Raw stored user:', storedUser); // DEBUG
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('[AuthContext] Parsed stored user:', parsedUser); // DEBUG
                // Normalize data from localStorage (now sessionStorage)
                // New format: { ...user, token: "..." }
                let normalizedUser = parsedUser;

                if (parsedUser.user && parsedUser.token) {
                    normalizedUser = { ...parsedUser.user, token: parsedUser.token };
                } else if (parsedUser.data && parsedUser.data.user) {
                    // Fallback for old format
                    normalizedUser = { ...parsedUser.data.user, token: parsedUser.data.token };
                }

                console.log('[AuthContext] Normalized stored user:', normalizedUser); // DEBUG
                return normalizedUser;
            } catch (e) {
                console.error("Failed to parse stored user", e);
                sessionStorage.removeItem('tracker_user');
            }
        }
        return null;
    });

    const [users, setUsers] = useState([]); // Kept for compatibility if used elsewhere
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        try {
            console.log('[AuthContext] Attempting login for:', email); // DEBUG
            const userData = await api.login(email, password);
            console.log('[AuthContext] API Login Response:', userData); // DEBUG

            // Normalize API response
            // New API structure: { message: "...", token: "...", user: { ... } }
            let normalizedUser = userData;

            if (userData.user && userData.token) {
                normalizedUser = { ...userData.user, token: userData.token };
            } else if (userData.data && userData.data.user) {
                // Fallback for old format
                normalizedUser = { ...userData.data.user, token: userData.data.token };
            }

            console.log('[AuthContext] Normalized Login User:', normalizedUser); // DEBUG
            setUser(normalizedUser);
            // Store the NORMALIZED user to avoid re-parsing issues, but if we store raw we must parse correct.
            // Let's store the normalized one to be clean.
            sessionStorage.setItem('tracker_user', JSON.stringify(normalizedUser));
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('tracker_user');
    };

    // Helper to fetch users (called by Admin page or on mount if needed)
    const fetchUsers = async () => {
        try {
            const data = await api.getUsers();
            // Normalize user data: ensure 'id' field exists (handle both 'id' and '_id')
            const normalizedUsers = Array.isArray(data) ? data.map(user => ({
                ...user,
                id: user.id || user._id || user.userId
            })) : [];
            setUsers(normalizedUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    // Load users if we are logged in - helpful for drop downs
    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const addUser = async (newUser) => {
        try {
            const response = await api.createUser(newUser);
            // Ensure we have the user object
            const createdUser = response.user || response;
            // Normalize: ensure 'id' field exists (handle both 'id' and '_id')
            const normalizedUser = {
                ...createdUser,
                id: createdUser.id || createdUser._id || createdUser.userId
            };
            setUsers(prev => [...prev, normalizedUser]);
            return true;
        } catch (error) {
            console.error("Failed to add user", error);
            return false;
        }
    };

    const updateUser = async (id, updates) => {
        try {
            // Ensure ID is converted to string for comparison
            const userId = String(id);
            const updatedUser = await api.updateUser(userId, updates);
            // Normalize: ensure 'id' field exists
            const normalizedUser = {
                ...updatedUser,
                id: updatedUser.id || updatedUser._id || updatedUser.userId || userId
            };
            // Compare IDs as strings to ensure proper matching (handle both 'id' and '_id')
            setUsers(prev => prev.map(u => {
                const uId = String(u.id || u._id || u.userId);
                return uId === userId ? normalizedUser : u;
            }));
            return true;
        } catch (error) {
            console.error("Failed to update user", error);
            return false;
        }
    };

    const deleteUser = async (id) => {
        try {
            await api.deleteUser(id);
            // Refresh users list
            await fetchUsers();
            return true;
        } catch (error) {
            console.error("Failed to delete user", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, users, addUser, updateUser, deleteUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
