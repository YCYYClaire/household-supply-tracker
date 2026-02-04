import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import StatCard from './StatCard';
import { AlertTriangle, Package, CheckCircle, TrendingUp } from 'lucide-react';

const Dashboard = ({ onViewChange }) => {
    const { items } = useInventory();
    const { settings } = usePersonalization();

    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.quantity <= i.threshold).length;
    const healthyStockItems = totalItems - lowStockItems;

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            <div className="storefront-header animate-fade-in">
                <div className="store-awning"></div>
                <div className="store-sign">
                    <h1 style={{ marginBottom: '0.5rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        Welcome to {settings.shopName}! 🏪
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }}>
                        Hello, {settings.ownerName}! Ready to open shop? 👋
                    </p>
                </div>
            </div>

            <div className="shop-window-display">
                <StatCard
                    title="Total Stock"
                    value={totalItems}
                    icon={Package}
                    color="primary"
                    onClick={() => onViewChange('inventory', 'all')}
                />
                <StatCard
                    title="Low Stock"
                    value={lowStockItems}
                    icon={AlertTriangle}
                    color="danger"
                    trend="Needs Restock!"
                    trendUp={false}
                    onClick={() => onViewChange('inventory', 'low')}
                />
                <StatCard
                    title="Healthy"
                    value={healthyStockItems}
                    icon={CheckCircle}
                    color="success"
                    trend="Looking good"
                    trendUp={true}
                    onClick={() => onViewChange('inventory', 'healthy')}
                />
                <StatCard
                    title="Expiring Soon"
                    value={items.filter(i => i.expiryDate && new Date(i.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                    icon={TrendingUp}
                    color="warning"
                    trend="Within 7 days"
                    trendUp={false}
                    onClick={() => onViewChange('inventory', 'expiring')}
                />
            </div>
        </div>
    );
};

export default Dashboard;
