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
            {/* Storefront Header Area */}
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

            {/* Shop Window Display (Stats) */}
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
                    value={items.filter(i => {
                        if (!i.expiryDate) return false;
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        const exp = new Date(i.expiryDate);
                        const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
                        return diffDays <= 7;
                    }).length}
                    icon={TrendingUp} // Using TrendingUp as a placeholder for "Timeline/Time"
                    color="warning"
                    trend="Within 7 days"
                    trendUp={false}
                    onClick={() => onViewChange('inventory', 'expiring')} // We'll need to handle this filter later if we want it to work
                />
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.8 }} className="animate-fade-in">
                <p>✨ Tap a card above to check the shelves! ✨</p>
            </div>
        </div>
    );
};

export default Dashboard;
