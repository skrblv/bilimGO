import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-surface border border-border rounded-lg p-6 md:p-8 ${className}`}>
            {children}
        </div>
    );
};