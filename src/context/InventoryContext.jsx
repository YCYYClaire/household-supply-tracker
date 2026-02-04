import React, { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  writeBatch
} from 'firebase/firestore';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
    const { user } = useAuth();
    const [localItems, setLocalItems] = useLocalStorage('inventory-items', []);
    const [localCategoryIcons, setLocalCategoryIcons] = useLocalStorage('inventory-category-icons', {});

    const [items, setItems] = useState([]);
    const [categoryIcons, setCategoryIcons] = useState({});
    const [loading, setLoading] = useState(true);

    const ensureString = (val, fallback = '') => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val.label) return val.label;
        if (typeof val === 'object' && val.name) return val.name;
        return String(val);
    };

    // Data Sync Logic
    useEffect(() => {
        if (!user) {
            // Unauthenticated: Use local storage
            setItems(localItems);
            setCategoryIcons(localCategoryIcons);
            setLoading(false);
            return;
        }

        // Authenticated: Sync with Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const inventoryColRef = collection(userDocRef, 'inventory');

        // 1. Initial Migration (one-time)
        const migrateData = async () => {
            if (localItems.length > 0) {
                const batch = writeBatch(db);
                localItems.forEach(item => {
                    const itemRef = doc(inventoryColRef, item.id);
                    batch.set(itemRef, item);
                });
                // Also migrate category icons
                await setDoc(userDocRef, { categoryIcons: localCategoryIcons }, { merge: true });
                await batch.commit();
                // Clear local storage to prevent future double-migration
                setLocalItems([]);
                setLocalCategoryIcons({});
            }
        };
        migrateData();

        // 2. Real-time Subscription for Inventory
        const unsubscribeInventory = onSnapshot(inventoryColRef, (snapshot) => {
            const firestoreItems = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setItems(firestoreItems);
            setLoading(false);
        });

        // 3. Real-time Subscription for User Settings (Category Icons)
        const unsubscribeSettings = onSnapshot(userDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setCategoryIcons(snapshot.data().categoryIcons || {});
            }
        });

        return () => {
            unsubscribeInventory();
            unsubscribeSettings();
        };
    }, [user]);

    // Actions
    const addItem = async (item) => {
        const id = generateId();
        const newItem = {
            id,
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

        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const itemRef = doc(collection(userDocRef, 'inventory'), id);
            await setDoc(itemRef, newItem);

            if (item.categoryIcon && item.category) {
                const catName = ensureString(item.category);
                const catIcon = ensureString(item.categoryIcon);
                await setDoc(userDocRef, {
                    categoryIcons: { ...categoryIcons, [catName]: catIcon }
                }, { merge: true });
            }
        } else {
            setLocalItems(prev => [...prev, newItem]);
            if (item.categoryIcon && item.category) {
                setLocalCategoryIcons(prev => ({ ...prev, [ensureString(item.category)]: ensureString(item.categoryIcon) }));
            }
        }
    };

    const updateItem = async (id, updates) => {
        const sanitizedUpdates = { ...updates, lastUpdated: new Date().toISOString() };
        if (updates.name) sanitizedUpdates.name = ensureString(updates.name);
        if (updates.category) sanitizedUpdates.category = ensureString(updates.category);
        if (updates.icon) sanitizedUpdates.icon = ensureString(updates.icon);

        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const itemRef = doc(collection(userDocRef, 'inventory'), id);
            await updateDoc(itemRef, sanitizedUpdates);

            if (sanitizedUpdates.category && updates.categoryIcon) {
                await setDoc(userDocRef, {
                    categoryIcons: { ...categoryIcons, [sanitizedUpdates.category]: ensureString(updates.categoryIcon) }
                }, { merge: true });
            }
        } else {
            setLocalItems(prev => prev.map(item => item.id === id ? { ...item, ...sanitizedUpdates } : item));
            if (sanitizedUpdates.category && updates.categoryIcon) {
                setLocalCategoryIcons(prev => ({ ...prev, [sanitizedUpdates.category]: ensureString(updates.categoryIcon) }));
            }
        }
    };

    const deleteItem = async (id) => {
        if (user) {
            const itemRef = doc(db, 'users', user.uid, 'inventory', id);
            await deleteDoc(itemRef);
        } else {
            setLocalItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const incrementItem = (id) => {
        const item = items.find(i => i.id === id);
        if (item) updateItem(id, { quantity: item.quantity + 1 });
    };

    const decrementItem = (id) => {
        const item = items.find(i => i.id === id);
        if (item) updateItem(id, { quantity: Math.max(0, item.quantity - 1) });
    };

    const setCategoryIcon = async (category, icon) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                categoryIcons: { ...categoryIcons, [category]: icon }
            }, { merge: true });
        } else {
            setLocalCategoryIcons(prev => ({ ...prev, [category]: icon }));
        }
    };

    const stats = {
        totalItems: items.length,
        lowStockCount: items.filter(item => item.quantity <= item.threshold).length,
        lowStockItems: items.filter(item => item.quantity <= item.threshold)
    };

    return (
        <InventoryContext.Provider value={{ items, categoryIcons, loading, actions: { addItem, updateItem, deleteItem, incrementItem, decrementItem, setCategoryIcon }, stats }}>
            {children}
        </InventoryContext.Provider>
    );
};
