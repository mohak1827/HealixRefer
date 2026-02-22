import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const ensureUserDoc = async (firebaseUser, desiredRole) => {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                role: desiredRole || 'User',
                createdAt: new Date().toISOString()
            });
        }
    };

    // Listen to Firebase Auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    await ensureUserDoc(firebaseUser);
                    // Fetch the user's custom role/data from Firestore
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || userData.name,
                            role: userData.role,
                            ...userData
                        });
                    } else {
                        // Fallback if no Firestore doc exists (e.g. created manually in console)
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName,
                            role: 'User' // Default role
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data from Firestore:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will handle fetching the role and setting the user state
            return userCredential.user;
        } catch (error) {
            console.error("Login Error:", error);
            throw new Error(getFriendlyErrorMessage(error.code) || 'Login failed. Check your credentials.');
        }
    };

    const loginWithGoogle = async (role) => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            await ensureUserDoc(userCredential.user, role);
            return userCredential.user;
        } catch (error) {
            console.error('Google Login Error:', error);
            const friendly = getFriendlyErrorMessage(error.code);
            throw new Error(friendly || `Google sign-in failed (${error.code || 'unknown'}). Please try again.`);
        }
    };

    const register = async (name, email, password, role) => {
        try {
            // 1. Create User in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Update their display name in Firebase Auth
            await updateProfile(firebaseUser, { displayName: name });

            // 3. Create a document in Firestore to store their Role and extra metadata
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name,
                email,
                role,
                createdAt: new Date().toISOString()
            });

            return firebaseUser;
        } catch (error) {
            console.error("Registration Error:", error);
            throw new Error(getFriendlyErrorMessage(error.code) || 'Registration failed. Please try again.');
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const updateUser = async (newData) => {
        if (!user || !user.uid) return;
        try {
            // Update Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, newData, { merge: true });

            // Update local state
            setUser(prev => ({ ...prev, ...newData }));
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    // Helper to translate ugly Firebase error codes into human-readable messages
    const getFriendlyErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                return 'Invalid email or password.';
            case 'auth/popup-closed-by-user':
                return 'Popup closed before completing sign-in.';
            case 'auth/cancelled-popup-request':
                return 'Cancelled because another sign-in popup was already open.';
            case 'auth/popup-blocked':
                return 'Popup was blocked by the browser. Please allow popups and try again.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized for OAuth. Add it in Firebase Auth settings.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled in Firebase. Enable Google provider in Firebase Auth.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password must be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return null;
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, register, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
