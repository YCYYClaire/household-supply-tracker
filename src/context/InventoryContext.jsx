import React, { createContext, useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// Simple ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const [items, setItems] = useLocalStorage('inventory-items', []);
    const [categoryIcons, setCategoryIcons] = useLocalStorage('inventory-category-icons', {});

    const ensureString = (val, fallback = '') => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val.label) return val.label;
        if (typeof val === 'object' && val.name) return val.name;
        return String(val);
    };

    React.useEffect(() => {
        const corrupted = items.some(item => typeof item.name === 'object' || typeof item.category === 'object');
        if (corrupted) {
            setItems(prev => prev.map(item => ({
                ...item,
                name: ensureString(item.name, 'Untitled'),
                category: ensureString(item.category, 'General'),
                icon: typeof item.icon === 'object' ? ensureString(item.icon, null) : item.icon
            })));
        }
    }, []);

    const addItem = (item) => {
        const newItem = {
            id: generateId(),
            name: ensureString(item.name, 'Untitled'),
            category: ensureString(item.category, 'General'),
            icon: ensureString(item.icon, null),
            quantity: Number(item.quantity) || 0,
            unit: ensureString(item.unit, 'pcs'),
            threshold: Number(item.threshold) || 0,
            purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
            expiryDate: item.expiryDate || null,
            lastUpdated: new Date().toISOString(),
        };

        if (item.categoryIcon && item.category) {
            setCategoryIcons(prev => ({ ...prev, [ensureString(item.category)]: ensureString(item.categoryIcon) }));
        }

        setItems((prev) => [...prev, newItem]);
    };

    const updateItem = (id, updates) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...updates, lastUpdated: new Date().toISOString() } : item))
        );
    };

    const deleteItem = (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const incrementItem = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + 1, lastUpdated: new Date().toISOString() } : item
            )
        );
    };

    const decrementItem = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1), lastUpdated: new Date().toISOString() } : item
            )
        );
    };

    const value = {
        items,
        categoryIcons,
        actions: {
            addItem,
            updateItem: (id, updates) => {
                const sanitizedUpdates = { ...updates };
                if (updates.name) sanitizedUpdates.name = ensureString(updates.name);
                if (updates.category) sanitizedUpdates.category = ensureString(updates.category);
                if (updates.icon) sanitizedUpdates.icon = ensureString(updates.icon);

                updateItem(id, sanitizedUpdates);
                if (sanitizedUpdates.category && updates.categoryIcon) {
                    setCategoryIcons(prev => ({ ...prev, [sanitizedUpdates.category]: ensureString(updates.categoryIcon) }));
                }
            },
            deleteItem,
            incrementItem,
            decrementItem,
            setCategoryIcon: (category, icon) => {
                setCategoryIcons(prev => ({ ...prev, [category]: icon }));
            }
        },
        stats: {
            totalItems: items.length,
            lowStockCount: items.filter(item => item.quantity <= item.threshold).length,
            lowStockItems: items.filter(item => item.quantity <= item.threshold)
        }
    };

    return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
