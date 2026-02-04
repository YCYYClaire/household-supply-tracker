import React, { useEffect } from 'react';
import Card from './Card';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem',
    };

    const closeBtnStyle = {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px' }}>
                <Card
                    className="animate-fade-in"
                    title={title}
                    style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                    actions={
                        <button style={closeBtnStyle} onClick={onClose}>
                            <X size={20} />
                        </button>
                    }
                >
                    <div style={{
                        overflowY: 'auto',
                        paddingRight: '0.5rem',
                        paddingBottom: '1rem',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--primary) transparent'
                    }}>
                        {children}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Modal;
