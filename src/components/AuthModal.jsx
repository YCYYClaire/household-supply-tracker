import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signup, login, auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

const AVATAR_EMOJIS = ['👤', '🐱', '🐶', '🦊', '🦁', '🐷', '🐨', '🐸', '🍎', '🍓', '🥕', '🍦', '🍩', '🍕', '🌮', '🎈'];

const AuthModal = ({ isOpen, onClose }) => {
    const { signup, login } = useAuth();
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('👤');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                await signup(email, password, displayName);
                // After signup, we need to update the photoURL as well
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { photoURL: selectedEmoji });
                }
            } else {
                await login(email, password);
            }
            onClose();
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.message.includes('auth/user-not-found') ? 'User not found.' : 
                   err.message.includes('auth/wrong-password') ? 'Wrong password.' : 
                   err.message.includes('auth/email-already-in-use') ? 'Email already in use.' : 
                   'Failed to authenticate. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isSignup ? "Create Account 🏪" : "Welcome Back Clerk! 👋"}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', background: '#fee2e2', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {isSignup && (
                    <>
                        <Input
                            label="Display Name"
                            placeholder="Owner name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                Pick an Avatar
                            </label>
                            <div 
                                style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(8, 1fr)', 
                                    gap: '6px',
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '8px',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '1rem'
                                }}
                            >
                                {AVATAR_EMOJIS.map(emoji => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setSelectedEmoji(emoji)}
                                        style={{
                                            fontSize: '1.2rem',
                                            padding: '4px',
                                            borderRadius: '8px',
                                            border: selectedEmoji === emoji ? '2px solid var(--primary)' : '2px solid transparent',
                                            background: selectedEmoji === emoji ? '#fff' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                    style={{ marginTop: '0.5rem' }}
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        isSignup ? (
                            <div className="flex items-center gap-2"><UserPlus size={20}/> Create Shop</div>
                        ) : (
                            <div className="flex items-center gap-2"><LogIn size={20}/> Log In</div>
                        )
                    )}
                </Button>

                <div className="text-center" style={{ marginTop: '0.5rem' }}>
                    <button 
                        type="button" 
                        onClick={() => setIsSignup(!isSignup)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                    >
                        {isSignup ? "Already have a shop? Log In" : "New here? Create your shop"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AuthModal;
