import React, { useState, useEffect } from 'react';
import { Home, Package, Settings } from 'lucide-react';
import { usePersonalization } from '../context/PersonalizationContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const Layout = ({ children, currentView, onNavigate }) => {
    const { settings, updateSettings } = usePersonalization();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempSettings, setTempSettings] = useState(settings);

    useEffect(() => {
        if (isSettingsOpen) setTempSettings(settings);
    }, [isSettingsOpen, settings]);

    const handleSaveSettings = (e) => {
        e.preventDefault();
        updateSettings(tempSettings);
        setIsSettingsOpen(false);
    };

    const THEMES = [
        { name: 'Mint', color: '#14b8a6' },
        { name: 'Berry', color: '#ec4899' },
        { name: 'Sky', color: '#0ea5e9' },
        { name: 'Lavender', color: '#8b5cf6' },
        { name: 'Peach', color: '#f97316' }
    ];

    return (
        <div className="layout-container flex" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
            <aside className="sidebar flex flex-col" style={{
                width: '280px',
                padding: '2rem',
                backgroundColor: 'var(--text-main)',
                color: '#fff',
                position: 'sticky',
                top: 0,
                height: '100vh',
                boxShadow: '4px 0 10px rgba(78, 52, 46, 0.1)'
            }}>
                <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '2rem' }}>🏠</div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#fff' }}>{settings.shopName}</h1>
                </div>

                <nav className="flex-1">
                    <button
                        className={`sidebar-btn w-full ${currentView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => onNavigate('dashboard')}
                    >
                        <Home size={20} />
                        <span>Dashboard</span>
                    </button>
                    <button
                        className={`sidebar-btn w-full ${currentView === 'inventory' ? 'active' : ''}`}
                        onClick={() => onNavigate('inventory')}
                    >
                        <Package size={20} />
                        <span>Inventory</span>
                    </button>
                </nav>

                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <button
                        className="sidebar-btn w-full"
                        onClick={() => setIsSettingsOpen(true)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', boxShadow: 'none' }}
                    >
                        <Settings size={20} />
                        <span>Shop Settings</span>
                    </button>
                    <div className="text-sm text-center opacity-70 mt-2">
                        Owner: {settings.ownerName}
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col" style={{ overflowY: 'auto', width: '100%', position: 'relative' }}>
                {children}
            </main>

            <Modal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                title="Personalize Your Shop ✨"
            >
                <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
                    <Input
                        label="Shop Name"
                        value={tempSettings.shopName}
                        onChange={(e) => setTempSettings({ ...tempSettings, shopName: e.target.value })}
                    />
                    <Input
                        label="Owner Name (Greeting)"
                        value={tempSettings.ownerName}
                        onChange={(e) => setTempSettings({ ...tempSettings, ownerName: e.target.value })}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Theme Color</label>
                        <div className="flex gap-3 flex-wrap">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.name}
                                    type="button"
                                    onClick={() => setTempSettings({ ...tempSettings, themeColor: theme.color, themeName: theme.name })}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        backgroundColor: theme.color,
                                        border: tempSettings.themeName === theme.name ? '3px solid var(--text-main)' : '3px solid #fff',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                        cursor: 'pointer',
                                        transform: tempSettings.themeName === theme.name ? 'scale(1.1)' : 'scale(1)',
                                        transition: 'all 0.2s'
                                    }}
                                    title={theme.name}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Layout;
