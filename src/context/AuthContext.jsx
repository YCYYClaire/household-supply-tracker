import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async (email, password, displayName) => {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(res.user, { displayName });
        }
        return res;
    };

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const updateProfileInfo = async (displayName, photoURL) => {
        if (!auth.currentUser) return;
        await updateProfile(auth.currentUser, { displayName, photoURL });
        // Manually trigger user state update to refresh UI
        setUser({ ...auth.currentUser, displayName, photoURL });
    };

    const value = {
        user,
        signup,
        login,
        logout,
        updateProfileInfo,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
