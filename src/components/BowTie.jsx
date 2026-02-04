import React from 'react';

const BowTie = ({ className = '', size = 32, color = 'var(--primary)' }) => {
    return (
        <svg
            width={size}
            height={size * 0.6}
            viewBox="0 0 100 60"
            fill={color}
            className={className}
            style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }}
        >
            <path d="M10,10 Q40,30 50,30 Q60,30 90,10 Q100,0 100,10 L90,50 Q80,60 50,30 Q20,60 10,50 L0,10 Q0,0 10,10 Z" />
            <circle cx="50" cy="30" r="8" fill="var(--accent)" />
        </svg>
    );
};

export default BowTie;
