import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const AVATAR_EMOJIS = ['👤', '🐱', '🐶', '🦊', '🦁', '🐷', '🐨', '🐸', '🍎', '🍓', '🥕', '🍦', '🍩', '🍕', '🌮', '🎈'];

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('👤');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup, updateProfileInfo } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, displayName);
                // Also set the initial emoji avatar
                await updateProfileInfo(displayName, selectedEmoji);
            }
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message.includes('auth/user-not-found') ? 'User not found' :
                err.message.includes('auth/wrong-password') ? 'Wrong password' :
                    err.message.includes('auth/email-already-in-use') ? 'Email already in use' :
                        'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isLogin ? "Welcome Back to Wellhouse! 🏪" : "Join the Wellhouse Family! ✨"}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ padding: '0.5rem' }}>
                {!isLogin && (
                    <>
                        <Input
                            label="Your Name"
                            placeholder="How should we call you?"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                Pick an Avatar
                            </label>
                            <div 
                                style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(8, 1fr)', 
                                    gap: '8px',
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: '0.5rem'
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
                                        className="emoji-option"
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
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && (
                    <div className="flex items-center gap-2 p-3 text-danger bg-danger-light" style={{ borderRadius: '12px', background: 'rgba(239, 83, 80, 0.1)', fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? "Processing..." : isLogin ? "Open Shop" : "Register Now"}
                </Button>

                <div className="text-center" style={{ marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                marginLeft: '0.5rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </form>
        </Modal>
    );
};

export default AuthModal;
