import React from 'react';
import clsx from 'clsx';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onDismiss?: () => void;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
                                                              message,
                                                              onDismiss,
                                                              className
                                                          }) => {
    return (
        <div className={clsx(
            'flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800',
            className
        )}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1">{message}</p>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-red-600 hover:text-red-800 text-lg font-bold"
                >
                    ×
                </button>
            )}
        </div>
    );
};