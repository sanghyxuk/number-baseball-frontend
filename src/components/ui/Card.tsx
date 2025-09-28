import React from 'react';
import clsx from 'clsx';
import { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({
                                              title,
                                              subtitle,
                                              children,
                                              className
                                          }) => {
    return (
        <div className={clsx('card', className)}>
            <div className="card-padding">
                {(title || subtitle) && (
                    <div className="mb-6">
                        {title && (
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-gray-600">
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};