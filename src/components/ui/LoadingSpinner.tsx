import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                                  size = 'md',
                                                                  className
                                                              }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={clsx(
            'border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin',
            sizeClasses[size],
            className
        )} />
    );
};