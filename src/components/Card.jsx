import React from 'react';
import BowTie from './BowTie';

const Card = ({ children, className = '', title, actions, showBow = false, style = {}, ...rest }) => {
    const cardStyle = {
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'visible',
        ...style
    };

    return (
        <div className={`animate-fade-in ${className}`} style={cardStyle} {...rest}>
            {showBow && (
                <div style={{ position: 'absolute', top: '-10px', left: '1rem', transform: 'rotate(-5deg)' }}>
                    <BowTie size={40} />
                </div>
            )}
            {(title || actions) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', marginTop: showBow ? '0.5rem' : '0' }}>
                    {title && <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h3>}
                    {actions && <div>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
