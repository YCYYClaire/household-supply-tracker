import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { User, Loader2, Check } from 'lucide-react';

const AVATAR_EMOJIS = [
    '👤', '🐱', '🐶', '🦊', '🦁', '🐷', '🐨', '🐸', 
    '🍎', '🍓', '🥕', '🍦', '🍩', '🍕', '🌮', '🎈',
    '✨', '🌈', '🌸', '🌞', '🌙', '⭐', '🍀', '💎'
];

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateProfileInfo } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [selectedEmoji, setSelectedEmoji] = useState(user?.photoURL || '👤');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveSuccess(false);
        try {
            await updateProfileInfo(displayName, selectedEmoji);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Personal Profile ✨"
        >
            <div className="flex flex-col items-center gap-6" style={{ padding: '0.5rem 0' }}>
                {/* Avatar Display */}
                <div 
                    style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '50%', 
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3.5rem',
                        border: '4px solid #fff',
                        boxShadow: 'var(--shadow-md)',
                        marginBottom: '0.5rem'
                    }}
                >
                    {selectedEmoji}
                </div>

                {/* Info Section */}
                <form onSubmit={handleSave} className="w-full flex flex-col gap-5">
                    <Input
                        label="Your Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Type your name..."
                        required
                    />

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Pick an Avatar
                        </label>
                        <div 
                            style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(6, 1fr)', 
                                gap: '8px',
                                background: 'rgba(0,0,0,0.03)',
                                padding: '12px',
                                borderRadius: 'var(--radius-md)',
                                maxHeight: '180px',
                                overflowY: 'auto'
                            }}
                        >
                            {AVATAR_EMOJIS.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setSelectedEmoji(emoji)}
                                    style={{
                                        fontSize: '1.5rem',
                                        padding: '8px',
                                        borderRadius: '12px',
                                        border: selectedEmoji === emoji ? '2px solid var(--primary)' : '2px solid transparent',
                                        background: selectedEmoji === emoji ? '#fff' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    className="emoji-option"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Email: <strong>{user?.email}</strong>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <Button variant="ghost" onClick={onClose} type="button">Close</Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={saving}
                            style={{ minWidth: '120px' }}
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : saveSuccess ? (
                                <div className="flex items-center gap-2"><Check size={18} /> Saved!</div>
                            ) : (
                                "Update Profile"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProfileModal;
