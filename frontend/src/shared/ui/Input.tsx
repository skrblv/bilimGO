import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, id, ...props }, ref) => {
        return (
            <div>
                <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-2">
                    {label}
                </label>
                <input
                    id={id}
                    ref={ref}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary focus:outline-none transition"
                    {...props}
                />
            </div>
        );
    }
);