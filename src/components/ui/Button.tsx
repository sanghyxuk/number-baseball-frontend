import React from 'react';
import clsx from 'clsx';
import { ButtonProps } from '../../types';

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  disabled = false,
                                                  loading = false,
                                                  onClick,
                                                  type = 'button',
                                                  className
                                              }) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger'
    };
    const sizeClasses = {
        sm: '',
        md: '',
        lg: 'btn-lg'
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={clsx(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                className
            )}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>처리중...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
};