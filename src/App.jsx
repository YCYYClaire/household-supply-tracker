import React, { useState, useEffect } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import InventoryList from './features/inventory/InventoryList';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [inventoryFilter, setInventoryFilter] = useState('all');

  const handleNavigate = (view, filter = 'all') => {
    setCurrentView(view);
    setInventoryFilter(filter);
  };

  return (
    <AuthProvider>
      <PersonalizationProvider>
        <InventoryProvider>
          <Layout currentView={currentView} onNavigate={handleNavigate}>
            {currentView === 'dashboard' && <Dashboard onViewChange={handleNavigate} />}
            {currentView === 'inventory' && <InventoryList initialFilter={inventoryFilter} />}
          </Layout>
        </InventoryProvider>
      </PersonalizationProvider>
    </AuthProvider>
  );
}

export default App;
