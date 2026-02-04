import React from 'react';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    className = '',
    onClick,
    disabled = false,
    type = 'button',
    ...props
}) => {
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: 'var(--radius-lg)',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        border: 'none',
        outline: 'none',
        textDecoration: 'none',
        fontFamily: 'inherit',
        position: 'relative',
    };

    const sizes = {
        sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },
        md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
        lg: { padding: '1rem 2rem', fontSize: '1.25rem' },
    };

    const style = {
        ...baseStyles,
        ...sizes[size],
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
    };

    return (
        <button
            type={type}
            className={`btn-${variant} ${className}`}
            style={style}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
