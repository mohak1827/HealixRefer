import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '/api/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial load: recover session from token
    useEffect(() => {
        const recoverSession = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    console.error("Session recovery failed:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        recoverSession();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            setUser(userData);
            return userData;
        } catch (error) {
            console.error("Login Error:", error);
            const message = error.response?.data?.message || 'Login failed. Check your credentials.';
            throw new Error(message);
        }
    };

    const register = async (name, email, password, role, extraData = {}) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password,
                role,
                ...extraData
            });
            return response.data;
        } catch (error) {
            console.error("Registration Error:", error);
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            throw new Error(message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateUser = async (newData) => {
        if (!user) return;
        // In a real app, you'd call a backend endpoint to update the user profile
        // For now, let's just update local state if needed or implement the backend part if it exists
        setUser(prev => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            updateUser,
            loading,
            // Add placeholder for Google sign-in methods to prevent breakage if called, but they won't do anything
            loginWithGoogle: () => { throw new Error("Google sign-in is not supported in 'normal' auth mode."); }
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
