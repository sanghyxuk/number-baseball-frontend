import React from 'react';
import clsx from 'clsx';
import { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({
                                                type = 'text',
                                                placeholder,
                                                value,
                                                onChange,
                                                disabled = false,
                                                maxLength,
                                                pattern,
                                                className
                                            }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e.target.value);
    };

    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            maxLength={maxLength}
            pattern={pattern}
            className={clsx('input', className)}
        />
    );
};
