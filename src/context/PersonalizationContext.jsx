import React, { createContext, useContext, useState, useEffect } from 'react';

const PersonalizationContext = createContext();

export const usePersonalization = () => {
    return useContext(PersonalizationContext);
};

export const PersonalizationProvider = ({ children }) => {
    // Default State
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('wellhouse_settings');
        return saved ? JSON.parse(saved) : {
            ownerName: 'Friend',
            shopName: 'Wellhouse',
            themeColor: '#14b8a6', // Default Teal
            themeName: 'Mint'
        };
    });

    useEffect(() => {
        localStorage.setItem('wellhouse_settings', JSON.stringify(settings));

        // Apply Theme Color Variable globally
        document.documentElement.style.setProperty('--primary', settings.themeColor);
        document.documentElement.style.setProperty('--primary-hover', adjustColor(settings.themeColor, -20));
    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <PersonalizationContext.Provider value={{ settings, updateSettings }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

// Helper to darken color for hover states
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
