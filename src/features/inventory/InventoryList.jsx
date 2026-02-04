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
    const [statusFilter, setStatusFilter] = useState(initialFilter || 'all');

    React.useEffect(() => {
        setStatusFilter(initialFilter || 'all');
    }, [initialFilter]);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;
        if (statusFilter === 'low') matchesStatus = item.quantity <= item.threshold;
        else if (statusFilter === 'healthy') matchesStatus = item.quantity > item.threshold;
        return matchesSearch && matchesStatus;
    });

    const itemsByCategory = filteredItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const filteredCategories = Object.entries(itemsByCategory)
        .map(([category, items]) => ({
            category,
            items: items.sort((a, b) => a.name.localeCompare(b.name))
        }))
        .sort((a, b) => a.category.localeCompare(b.category));

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
            <div style={{ padding: '2rem 2rem 0 2rem' }}>
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: '2rem', textShadow: '2px 2px 0 #fff' }}>My Inventory</h2>
                    <Button onClick={() => openAddModal()}>
                        <Plus size={18} /> Add Item
                    </Button>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
                    <div style={{ maxWidth: '400px', flex: 1 }}>
                        <Input
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-10 w-full">
                {filteredCategories.length === 0 ? (
                    <div className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
                        No items found. Start adding some to populate your shelves!
                    </div>
                ) : (
                    filteredCategories.map(({ category, items }) => (
                        <div key={category} className="shelf-section">
                            <div className="shelf-category-title">
                                <span style={{ marginRight: '0.25rem' }}>
                                    {categoryIcons[category] || (items[0] && getItemIcon(items[0].name)) || '📁'}
                                </span>
                                {category} <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>({items.length})</span>
                            </div>
                            <div className="shelf">
                                <div className="shelf-items-grid">
                                    {items.map(item => (
                                        <div key={item.id} className="shelf-item-card">
                                            <div className="item-icon-display">{item.icon || getItemIcon(item.name)}</div>
                                            <div className="shelf-item-card-content">
                                                <div className="item-name-display">
                                                    {item.name}
                                                    {item.quantity <= item.threshold && <AlertTriangle size={16} className="text-danger bounce-icon" />}
                                                </div>
                                                <div className="item-qty-control">
                                                    <button className="qty-btn" onClick={() => actions.decrementItem(item.id)}><Minus size={14}/></button>
                                                    <span className="qty-value">{item.quantity} <span className="qty-unit">{item.unit}</span></span>
                                                    <button className="qty-btn" onClick={() => actions.incrementItem(item.id)}><Plus size={14}/></button>
                                                </div>
                                            </div>
                                            <div className="item-actions">
                                                <button className="action-icon-btn edit" onClick={() => openEditModal(item)}><Edit2 size={16}/></button>
                                                <button className="action-icon-btn delete" onClick={() => actions.deleteItem(item.id)}><Trash2 size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="shelf-item-card" style={{ borderStyle: 'dashed', background: 'rgba(255,255,255,0.3)', opacity: 0.7 }} onClick={() => openAddModal(category)}>
                                        <Plus size={40} style={{ color: 'var(--primary)' }} />
                                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>Add to {category}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Item' : 'Add New Item'}>
                <InventoryForm initialData={editingItem} initialCategory={selectedCategory} onSubmit={editingItem ? handleUpdateItem : handleAddItem} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default InventoryList;
