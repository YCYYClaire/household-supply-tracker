import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import InventoryForm from './InventoryForm';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Minus } from 'lucide-react';
import { getItemIcon } from '../../utils/inventoryData';

const InventoryList = ({ initialFilter }) => {
    const { items, actions, categoryIcons } = useInventory();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    // We can use a local filter state that initializes from props, or just use props directly if appropriate
    // Let's allow the user to clear the "filter" by typing in search or just respect it as a mode.
    // For simplicity, let's treat "initialFilter" as a one-time setup for the search/filter view.

    // If initialFilter is "low", we can pre-set a filter mode, but since we only have "searchTerm",
    // let's add a "statusFilter" state.
    const [statusFilter, setStatusFilter] = useState(initialFilter || 'all');

    // Reset status filter if initialFilter changes (e.g. re-navigating from dashboard)
    React.useEffect(() => {
        if (initialFilter) {
            setStatusFilter(initialFilter);
        } else {
            setStatusFilter('all');
        }
    }, [initialFilter]);

    // Filtering
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'low') {
            matchesStatus = item.quantity <= item.threshold;
        } else if (statusFilter === 'healthy') {
            matchesStatus = item.quantity > item.threshold;
        } else if (statusFilter === 'expiring') {
            if (!item.expiryDate) matchesStatus = false;
            else {
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const exp = new Date(item.expiryDate);
                const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
                matchesStatus = diffDays <= 7;
            }
        }

        return matchesSearch && matchesStatus;
    });

    // Group by category
    const itemsByCategory = filteredItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // Convert to array format for rendering (Sorted alphabetically by category)
    const filteredCategories = Object.entries(itemsByCategory)
        .map(([category, items]) => ({
            category,
            items: items.sort((a, b) => a.name.localeCompare(b.name)) // Sort items within shelf
        }))
        .sort((a, b) => a.category.localeCompare(b.category)); // Sort shelves

    const handleAddItem = (data) => {
        actions.addItem(data);
        setIsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleUpdateItem = (data) => {
        if (editingItem) {
            actions.updateItem(editingItem.id, data);
            setEditingItem(null);
            setIsModalOpen(false);
        }
    };

    const openAddModal = (category = null) => {
        setEditingItem(null);
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    return (
        <div className="inventory-view-container">
            {/* Header & Controls Section with Padding */}
            <div style={{ padding: '2rem 2rem 0 2rem' }}>
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: '2rem', textShadow: '2px 2px 0 #fff' }}>My Inventory</h2>
                    <Button onClick={openAddModal}>
                        <Plus size={18} /> Add Item
                    </Button>
                </div>

                {/* Search Bar & Filter Status */}
                <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
                    <div style={{ maxWidth: '400px', flex: 1 }}>
                        <Input
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}
                        />
                    </div>
                    {statusFilter !== 'all' && (
                        <div className="flex items-center gap-2 bg-surface p-2 rounded border shadow-sm">
                            <span className="text-sm font-bold capitalize" style={{ color: 'var(--primary)' }}>
                                Filter: {statusFilter} Stock
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => setStatusFilter('all')}>
                                Clear
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Shelf Display */}
            <div className="flex flex-col gap-10 w-full">
                {filteredCategories.length === 0 ? (
                    <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                        No items found. Start adding some to populate your shelves!
                    </div>
                ) : (
                    filteredCategories.map(({ category, items }) => (
                        items.length > 0 && (
                            <div key={category} className="shelf-section">
                                <div className="shelf-category-title">
                                    <span style={{ marginRight: '0.25rem' }}>
                                        {categoryIcons[category] || (items[0] && getItemIcon(items[0].name)) || '📁'}
                                    </span>
                                    {category} <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>({items.length})</span>
                                </div>
                                <div className="shelf">
                                    <div className="shelf-items-grid">
                                        {items.map(item => {
                                            const isLowStock = item.quantity <= item.threshold;
                                            return (
                                                <div key={item.id} className="shelf-item-card">
                                                    {/* Icon - Fixed at top */}
                                                    <div className="item-icon-display">
                                                        {item.icon || getItemIcon(item.name)}
                                                    </div>

                                                    {/* Scrollable content wrapper */}
                                                    <div className="shelf-item-card-content">
                                                        {/* Name */}
                                                        <div className="item-name-display">
                                                            {item.name}
                                                            {isLowStock && <AlertTriangle size={16} className="text-danger bounce-icon" />}
                                                        </div>

                                                        {/* Expiry Pill */}
                                                        {item.expiryDate && (
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                marginBottom: '0.5rem',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                background: (() => {
                                                                    const now = new Date();
                                                                    now.setHours(0, 0, 0, 0);
                                                                    const exp = new Date(item.expiryDate);
                                                                    const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
                                                                    return exp < now ? '#fee2e2' :
                                                                        diffDays <= 7 ? '#ffedd5' :
                                                                            '#f5f5f5';
                                                                })(),
                                                                color: (() => {
                                                                    const now = new Date();
                                                                    now.setHours(0, 0, 0, 0);
                                                                    const exp = new Date(item.expiryDate);
                                                                    const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
                                                                    return exp < now ? 'var(--danger)' :
                                                                        diffDays <= 7 ? '#c2410c' :
                                                                            'var(--text-muted)';
                                                                })(),
                                                                fontWeight: 600,
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}>
                                                                {(() => {
                                                                    const now = new Date();
                                                                    now.setHours(0, 0, 0, 0);
                                                                    const exp = new Date(item.expiryDate);
                                                                    return exp < now ? 'Expired!' : `Exp: ${exp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                                                                })()}
                                                            </div>
                                                        )}

                                                        {/* Quantity Control Row */}
                                                        <div className="item-qty-control">
                                                            <button className="qty-btn" onClick={() => actions.decrementItem(item.id)}>
                                                                <Minus size={14} />
                                                            </button>

                                                            <span className="qty-value">
                                                                {item.quantity} <span className="qty-unit">{item.unit}</span>
                                                            </span>

                                                            <button className="qty-btn" onClick={() => actions.incrementItem(item.id)}>
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Actions Row - Fixed at bottom */}
                                                    <div className="item-actions">
                                                        <button className="action-icon-btn edit" onClick={() => openEditModal(item)}>
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button className="action-icon-btn delete" onClick={() => actions.deleteItem(item.id)}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Add Item Card inside the shelf */}
                                        <div
                                            className="shelf-item-card"
                                            style={{
                                                borderStyle: 'dashed',
                                                cursor: 'pointer',
                                                background: 'rgba(255,255,255,0.3)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0.7
                                            }}
                                            onClick={() => openAddModal(category)}
                                        >
                                            <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                                                <Plus size={40} />
                                            </div>
                                            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>Add to {category}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Item' : 'Add New Item'}
            >
                <InventoryForm
                    initialData={editingItem}
                    initialCategory={selectedCategory}
                    onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default InventoryList;
