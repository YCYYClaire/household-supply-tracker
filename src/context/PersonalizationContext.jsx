import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const PersonalizationContext = createContext();

export const usePersonalization = () => useContext(PersonalizationContext);

export const PersonalizationProvider = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        ownerName: 'Friend',
        shopName: 'Wellhouse',
        themeColor: '#14b8a6',
        themeName: 'Mint'
    });

    // 1. Load settings from localStorage initially or Firestore if logged in
    useEffect(() => {
        if (!user) {
            const saved = localStorage.getItem('wellhouse_settings');
            if (saved) setSettings(JSON.parse(saved));
            return;
        }

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists() && snapshot.data().settings) {
                setSettings(snapshot.data().settings);
            } else {
                // If user exists but has no cloud settings, check local storage for migration
                const saved = localStorage.getItem('wellhouse_settings');
                if (saved) {
                    const local = JSON.parse(saved);
                    setSettings(local);
                    setDoc(userDocRef, { settings: local }, { merge: true });
                    localStorage.removeItem('wellhouse_settings');
                }
            }
        });

        return unsubscribe;
    }, [user]);

    // 2. Global theme application
    useEffect(() => {
        document.documentElement.style.setProperty('--primary', settings.themeColor);
        document.documentElement.style.setProperty('--primary-hover', adjustColor(settings.themeColor, -20));

        if (!user) {
            localStorage.setItem('wellhouse_settings', JSON.stringify(settings));
        }
    }, [settings, user]);

    const updateSettings = async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        setSettings(merged);

        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { settings: merged }, { merge: true });
        }
    };

    return (
        <PersonalizationContext.Provider value={{ settings, updateSettings }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
