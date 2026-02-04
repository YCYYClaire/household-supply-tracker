import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password, displayName);
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
                    <Input
                        label="Your Name"
                        placeholder="How should we call you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                    />
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
