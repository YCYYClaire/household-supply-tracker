import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { Camera, User, Loader2, Check } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateProfileInfo, uploadAvatar } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadAvatar(file);
        } catch (err) {
            console.error('Failed to upload avatar:', err);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveSuccess(false);
        try {
            await updateProfileInfo(displayName, user.photoURL);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update name. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Personal Profile ✨"
        >
            <div className="flex flex-col items-center gap-6" style={{ padding: '1rem 0' }}>
                {/* Avatar Section */}
                <div className="relative" style={{ width: '120px', height: '120px' }}>
                    <div 
                        className="profile-avatar-large"
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%', 
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            overflow: 'hidden',
                            border: '4px solid #fff',
                            boxShadow: 'var(--shadow-md)'
                        }}
                    >
                        {user?.photoURL ? (
                            <img 
                                src={user.photoURL} 
                                alt="Avatar" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        ) : (
                            <span style={{ color: '#fff' }}>👤</span>
                        )}
                    </div>
                    
                    <button
                        onClick={triggerFileInput}
                        disabled={uploading}
                        className="avatar-edit-btn"
                        style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            backgroundColor: '#fff',
                            border: '2px solid var(--text-main)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            color: 'var(--text-main)'
                        }}
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        style={{ display: 'none' }} 
                        accept="image/*"
                    />
                </div>

                {/* Info Section */}
                <form onSubmit={handleSave} className="w-full flex flex-col gap-4">
                    <Input
                        label="Your Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Type your name..."
                        required
                    />
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Registered Email: <strong>{user?.email}</strong>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <Button variant="ghost" onClick={onClose} type="button">Close</Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={saving || uploading}
                            style={{ minWidth: '120px' }}
                        >
                            {saving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : saveSuccess ? (
                                <div className="flex items-center gap-2"><Check size={18} /> Saved!</div>
                            ) : (
                                "Update Name"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProfileModal;
