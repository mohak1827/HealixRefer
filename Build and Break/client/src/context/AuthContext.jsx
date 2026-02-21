import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const DEMO_USERS = [
    { id: 'u1', name: 'Ramesh Kumar', email: 'patient@healix.ai', password: 'password123', role: 'Patient', village: 'Sehore', age: 45, contact: '9876543210' },
    { id: 'u2', name: 'Dr. Arjun Sharma', email: 'doctor@healix.ai', password: 'password123', role: 'Doctor', phcName: 'Sehore PHC' },
    { id: 'u3', name: 'Admin Priya Singh', email: 'admin@healix.ai', password: 'password123', role: 'Hospital Admin', hospitalId: 1 },
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const allUsers = localStorage.getItem('healix_all_users');
        if (!allUsers) {
            localStorage.setItem('healix_all_users', JSON.stringify(DEMO_USERS));
        }
    }, []);

    const login = async (email, password) => {
        const allUsers = JSON.parse(localStorage.getItem('healix_all_users') || '[]');
        const userMatch = allUsers.find(u => u.email === email && u.password === password);

        if (!userMatch) {
            throw new Error('Invalid credentials');
        }

        const sessionUser = { ...userMatch };
        delete sessionUser.password;

        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        localStorage.setItem('token', 'local_sim_token_' + Date.now());
        return sessionUser;
    };

    const register = async (name, email, password, role) => {
        const allUsers = JSON.parse(localStorage.getItem('healix_all_users') || '[]');
        if (allUsers.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: 'u' + Date.now(),
            name, email, password, role,
            hospitalId: role === 'Hospital Admin' ? 1 : null
        };

        allUsers.push(newUser);
        localStorage.setItem('healix_all_users', JSON.stringify(allUsers));

        const sessionUser = { ...newUser };
        delete sessionUser.password;
        setUser(sessionUser);
        localStorage.setItem('user', JSON.stringify(sessionUser));
        localStorage.setItem('token', 'local_sim_token_' + Date.now());
        return sessionUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
