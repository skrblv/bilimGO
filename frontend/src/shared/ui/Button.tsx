import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
    as?: 'button' | 'span';
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    as = 'button',
    ...props
}) => {
    const baseStyles = 'w-full font-semibold rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition duration-150 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
    
    // --- ВОТ ИСПРАВЛЕНИЕ ---
    const variantStyles = {
        primary: 'bg-primary text-background hover:bg-secondary focus:ring-primary',
        secondary: 'bg-surface text-primary border border-primary hover:bg-border',
    };

    const content = (
        <>
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </>
    );

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${isLoading ? 'opacity-75' : ''} ${className}`;

    if (as === 'span') {
        return (
            <span className={combinedClassName}>
                {content}
            </span>
        );
    }
    
    return (
        <button
            className={combinedClassName}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {content}
        </button>
    );
};