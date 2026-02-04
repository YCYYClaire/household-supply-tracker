import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useInventory } from '../../context/InventoryContext';
import { PREDEFINED_CATEGORIES, PREDEFINED_UNITS, CATEGORY_ITEMS_MAP } from '../../utils/inventoryData';

// -------------------------------------------------------------------------
// Sub-components (Combobox)
// -------------------------------------------------------------------------
const Combobox = ({ label, value, onChange, options, placeholder }) => {
    const [showList, setShowList] = useState(false);

    const handleOptionClick = (opt) => {
        // If option is object, use label. If string, use directly.
        const val = typeof opt === 'object' ? opt.label : opt;
        onChange(val); // Parent handles setting state
        setShowList(false);
    };

    const getLabel = (opt) => typeof opt === 'object' ? opt.label : opt;
    const getIcon = (opt) => typeof opt === 'object' ? opt.icon : null;

    return (
        <div style={{ position: 'relative', flex: 1 }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</label>}
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setShowList(true)}
                onBlur={() => setTimeout(() => setShowList(false), 200)}
                placeholder={placeholder}
                autoComplete="off"
            />
            {showList && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    backgroundColor: '#fff', border: '1px solid var(--border)',
                    borderRadius: '0 0 12px 12px', boxShadow: 'var(--shadow-lg)',
                    zIndex: 100, padding: '0.5rem', maxHeight: '200px', overflowY: 'auto',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem'
                }}>
                    {options.map((opt, idx) => (
                        <div key={idx} onMouseDown={() => handleOptionClick(opt)}
                            style={{
                                padding: '0.5rem', cursor: 'pointer', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', transition: 'all 0.1s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-body)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                        >
                            {getIcon(opt) && <div style={{ fontSize: '1.2rem' }}>{getIcon(opt)}</div>}
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{getLabel(opt)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const EmojiPicker = ({ value, onChange, label }) => {
    const emojis = ['📦', '✨', '💄', '🧴', '🍎', '🥦', '🥛', '🥩', '✏️', '🧻', '💊', '🔋', '🏠', '🧸', '🍷', '🍖', '🍙', '🍦'];
    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>{label}</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                    fontSize: '1.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border)'
                }}>
                    {value || '📦'}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                    {emojis.map(e => (
                        <button key={e} type="button" onClick={() => onChange(e)}
                            style={{
                                width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer',
                                fontSize: '1.2rem', borderRadius: '4px', transition: 'background 0.2s',
                                padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            onMouseEnter={(ex) => ex.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(ex) => ex.currentTarget.style.background = 'transparent'}
                        >
                            {e}
                        </button>
                    ))}
                    <input
                        type="text"
                        placeholder="Or type emoji..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{
                            width: '100px', height: '28px', fontSize: '0.8rem', padding: '0 4px',
                            border: '1px solid var(--border)', borderRadius: '4px'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

const InventoryForm = ({ onSubmit, initialData, onCancel, initialCategory }) => {
    const { items, categoryIcons } = useInventory();
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [customCategoryName, setCustomCategoryName] = useState('');
    const [customCategoryIcon, setCustomCategoryIcon] = useState('📁');

    // Derive used categories that are NOT predefined
    const predefinedLabels = PREDEFINED_CATEGORIES.map(c => c.label);
    const usedCustomCategories = Array.from(new Set(
        items
            .map(item => item.category)
            .filter(cat => cat && !predefinedLabels.includes(cat))
    )).map(cat => ({
        label: cat,
        icon: categoryIcons[cat] || '📁'
    }));

    const allCategories = [...PREDEFINED_CATEGORIES, ...usedCustomCategories].sort((a, b) =>
        a.label.localeCompare(b.label)
    );

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    // Initialize with default purchaseDate as Today
    const [formData, setFormData] = useState({
        name: '',
        category: initialCategory || '',
        icon: '', // Custom icon for item
        quantity: 1,
        unit: 'pcs',
        threshold: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        shelfLifeDuration: '',
        shelfLifeUnit: 'Days' // Days, Weeks, Months, Years, Unlimited
    });

    useEffect(() => {
        if (initialCategory) {
            const isPredefined = PREDEFINED_CATEGORIES.some(c => c.label === initialCategory);
            if (!isPredefined && initialCategory) {
                // Check if it's already an existing custom category
                const existing = usedCustomCategories.find(c => c.label === initialCategory);
                if (!existing) {
                    setIsCustomCategory(true);
                    setCustomCategoryName(initialCategory);
                }
            }
        }
    }, [initialCategory]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                purchaseDate: initialData.purchaseDate || new Date().toISOString().split('T')[0],
                shelfLifeDuration: '',
                shelfLifeUnit: 'Days'
            });

            // Check if initial category was custom
            if (initialData.category && !predefinedLabels.includes(initialData.category)) {
                setIsCustomCategory(true);
                setCustomCategoryName(String(initialData.category || ''));
                setCustomCategoryIcon(String(categoryIcons[initialData.category] || '📁'));
            }
        }
    }, [initialData]);

    // SMART AUTO-CATEGORY SELECTION
    useEffect(() => {
        if (!formData.name) return;

        // Find which predefined category this item belongs to
        for (const [catName, itemList] of Object.entries(CATEGORY_ITEMS_MAP)) {
            const foundItem = itemList.find(it => it.label === formData.name);
            if (foundItem) {
                // If found, auto-select category AND set item icon if not already set
                setFormData(prev => ({
                    ...prev,
                    category: catName,
                    icon: prev.icon || foundItem.icon
                }));
                setIsCustomCategory(false);
                break;
            }
        }
    }, [formData.name]);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCategoryClick = (categoryLabel) => {
        setIsCustomCategory(false);
        setFormData(prev => ({ ...prev, category: categoryLabel }));
    };

    const handleCustomClick = () => {
        setIsCustomCategory(true);
        setFormData(prev => ({ ...prev, category: '' }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Calculate Expiry Date logic
        let calculatedExpiry = null;

        if (formData.shelfLifeUnit !== 'Unlimited' && formData.shelfLifeDuration) {
            const duration = parseInt(formData.shelfLifeDuration);
            if (!isNaN(duration) && duration > 0) {
                const date = new Date(formData.purchaseDate);
                let daysToAdd = 0;

                switch (formData.shelfLifeUnit) {
                    case 'Weeks': daysToAdd = duration * 7; break;
                    case 'Months': daysToAdd = duration * 30; break;
                    case 'Years': daysToAdd = duration * 365; break;
                    default: daysToAdd = duration; // Days
                }

                date.setDate(date.getDate() + daysToAdd);
                calculatedExpiry = date.toISOString().split('T')[0];
            }
        } else if (initialData && initialData.expiryDate) {
            // Preserve existing if not recalculated
            calculatedExpiry = initialData.expiryDate;
        }

        onSubmit({
            ...formData,
            category: isCustomCategory ? customCategoryName : formData.category,
            categoryIcon: isCustomCategory ? customCategoryIcon : null,
            expiryDate: calculatedExpiry
        });
    };

    // Derived options (sorted alphabetically)
    const ALL_NAMES = Object.values(CATEGORY_ITEMS_MAP).flat().sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const currentNameOptions = (formData.category && CATEGORY_ITEMS_MAP[formData.category]
        ? CATEGORY_ITEMS_MAP[formData.category] : ALL_NAMES).sort((a, b) => {
            const labelA = typeof a === 'object' ? a.label : a;
            const labelB = typeof b === 'object' ? b.label : b;
            return labelA.localeCompare(labelB);
        });

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* 1. Category Grid */}
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                    {allCategories.map(cat => (
                        <button
                            key={cat.label}
                            type="button"
                            onClick={() => handleCategoryClick(cat.label)}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem',
                                border: (!isCustomCategory && formData.category === cat.label) ? '2px solid var(--primary)' : '1px solid var(--border)',
                                borderRadius: '12px', background: (!isCustomCategory && formData.category === cat.label) ? 'var(--bg-body)' : '#fff',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{cat.label}</span>
                        </button>
                    ))}
                    {/* Add Custom Button */}
                    <button
                        type="button"
                        onClick={handleCustomClick}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem',
                            border: isCustomCategory ? '2px solid var(--primary)' : '1px solid var(--border)',
                            borderRadius: '12px', background: isCustomCategory ? 'var(--bg-body)' : '#fff',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>➕</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Custom</span>
                    </button>
                </div>

                {isCustomCategory && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <Input
                            label="New Category Name"
                            placeholder="e.g. Pets, Gaming..."
                            value={customCategoryName}
                            onChange={(e) => setCustomCategoryName(e.target.value)}
                            autoFocus
                        />
                        <EmojiPicker
                            label="Category Icon"
                            value={customCategoryIcon}
                            onChange={setCustomCategoryIcon}
                        />
                    </div>
                )}
            </div>

            {/* 2. Name & Quantity Row */}
            <div className="flex gap-4">
                <div style={{ flex: 3 }}>
                    <div className="flex gap-2 items-end">
                        <div style={{ flex: 1 }}>
                            <Combobox
                                label="Item Name"
                                value={formData.name}
                                onChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                                options={currentNameOptions}
                                placeholder={formData.category ? `Select ${formData.category} item...` : "Type or select..."}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        <EmojiPicker
                            label="Item Icon"
                            value={formData.icon}
                            onChange={(emoji) => setFormData(prev => ({ ...prev, icon: emoji }))}
                        />
                    </div>
                </div>
                <div style={{ flex: 2, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quantity</label>
                    <div className="flex gap-2">
                        <div style={{ flex: 1, minWidth: '80px' }}>
                            <Input
                                type="number" min="0" value={formData.quantity}
                                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                        <div style={{ flex: '0 0 120px' }}> {/* Fixed width 120px, no shrink */}
                            <Combobox
                                label="" // grid layout handles label above
                                value={formData.unit}
                                onChange={(val) => setFormData(prev => ({ ...prev, unit: val }))}
                                options={PREDEFINED_UNITS}
                                placeholder="Unit"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Freshness Tracking (Flexible) */}
            <div style={{ background: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📅 Freshness & Expiry
                </h4>
                <div className="flex gap-4">
                    <div style={{ flex: 1 }}>
                        <Input
                            label="Bought On"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        />
                    </div>
                    {/* Flexible Expiry Inputs */}
                    <div style={{ flex: 1.5, display: 'flex', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                            <label>Shelf Life</label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="e.g. 19"
                                value={formData.shelfLifeDuration}
                                onChange={(e) => setFormData(prev => ({ ...prev, shelfLifeDuration: e.target.value }))}
                                disabled={formData.shelfLifeUnit === 'Unlimited'}
                            />
                        </div>
                        <div style={{ width: '100px' }}>
                            <label>&nbsp;</label> {/* Spacer for alignment */}
                            <select
                                value={formData.shelfLifeUnit}
                                onChange={(e) => setFormData(prev => ({ ...prev, shelfLifeUnit: e.target.value }))}
                            >
                                <option value="Days">Days</option>
                                <option value="Weeks">Weeks</option>
                                <option value="Months">Months</option>
                                <option value="Years">Years</option>
                                <option value="Unlimited">Unlimited</option>
                            </select>
                        </div>
                    </div>
                </div>
                {initialData?.expiryDate && !formData.shelfLifeDuration && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        Current Expiry: {new Date(initialData.expiryDate).toLocaleDateString()}
                    </div>
                )}
                {formData.shelfLifeDuration && formData.shelfLifeUnit !== 'Unlimited' && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        * This will calculate a new expiry date based on the shelf life.
                    </div>
                )}
            </div>

            {/* 4. Threshold & Actions */}
            <div>
                <Input
                    label="Low Stock Alert Threshold"
                    type="number" min="0"
                    value={formData.threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                />
            </div>

            <div className="flex gap-3 mt-4">
                {onCancel && <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>}
                <Button type="submit" variant="primary" className="flex-1">
                    {initialData ? 'Update Item' : 'Add to Shelf'}
                </Button>
            </div>
        </form>
    );
};

export default InventoryForm;
