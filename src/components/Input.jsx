import React from 'react';

const Input = ({ label, id, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-2 w-full ${className}`}>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                id={id}
                className="input-field"
                {...props}
            />
            {error && <span className="text-danger text-sm font-bold">{error}</span>}
        </div>
    );
};

export default Input;
