import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { PersonalizationProvider } from './context/PersonalizationContext';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import InventoryList from './features/inventory/InventoryList';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [filterParams, setFilterParams] = useState(null);

  const handleNavigate = (view, params = null) => {
    setCurrentView(view);
    setFilterParams(params);
  };

  return (
    <PersonalizationProvider>
      <InventoryProvider>
        <Layout currentView={currentView} onNavigate={handleNavigate}>
          {currentView === 'dashboard' ? (
            <Dashboard onViewChange={handleNavigate} />
          ) : (
            <InventoryList initialFilter={filterParams} />
          )}
        </Layout>
      </InventoryProvider>
    </PersonalizationProvider>
  );
}

export default App;
