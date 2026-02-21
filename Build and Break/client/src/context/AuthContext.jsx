import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS_KEY = 'healix_users';
const SESSION_KEY = 'healix_session';

const DEMO_USERS = [
    { id: 'demo_Patient', name: 'Ramesh Kumar', email: 'patient@healix.ai', password: 'password123', role: 'Patient', village: 'Sehore', age: 45, contact: '9876543210' },
    { id: 'demo_Doctor', name: 'Dr. Arjun Sharma', email: 'doctor@healix.ai', password: 'password123', role: 'Doctor', phcName: 'Sehore PHC' },
    { id: 'demo_Hospital_Admin', name: 'Admin Priya Singh', email: 'admin@healix.ai', password: 'password123', role: 'Hospital Admin', hospitalId: 1 },
    { id: 'demo_Ambulance', name: 'Ravi Kumar', email: 'ambulance@healix.ai', password: 'password123', role: 'Ambulance', vehicleNo: 'MP-04-AB-1234' },
    { id: 'demo_Super_Admin', name: 'Dr. Meera Patel', email: 'superadmin@healix.ai', password: 'password123', role: 'Super Admin', district: 'Sehore' },
];

function getUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedDemoUsers() {
    let users = getUsers();
    if (!users) {
        users = [...DEMO_USERS];
        saveUsers(users);
    }
    return users;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: seed demo users + restore session
    useEffect(() => {
        seedDemoUsers();
        try {
            const session = localStorage.getItem(SESSION_KEY);
            if (session) {
                setUser(JSON.parse(session));
            }
        } catch {
            localStorage.removeItem(SESSION_KEY);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const users = getUsers() || [];
        const found = users.find(u => u.email === email);
        if (!found) {
            throw new Error('No account found with this email.');
        }
        if (found.password !== password) {
            throw new Error('Invalid password. Please try again.');
        }
        // Strip password before storing in session
        const { password: _, ...sessionUser } = found;
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
        setUser(sessionUser);
        return sessionUser;
    };

    const register = async (name, email, password, role) => {
        const users = getUsers() || seedDemoUsers();
        const exists = users.find(u => u.email === email);
        if (exists) {
            throw new Error('An account with this email already exists.');
        }
        const newUser = {
            id: `user_${Date.now()}`,
            name,
            email,
            password,
            role,
        };
        users.push(newUser);
        saveUsers(users);
    };

    const logout = () => {
        localStorage.removeItem(SESSION_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
