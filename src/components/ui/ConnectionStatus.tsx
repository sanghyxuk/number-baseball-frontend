import React from 'react';
import clsx from 'clsx';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
    isConnected: boolean;
    isConnecting: boolean;
    className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
                                                                      isConnected,
                                                                      isConnecting,
                                                                      className
                                                                  }) => {
    if (isConnecting) {
        return (
            <div className={clsx(
                'flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm',
                className
            )}>
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>연결 중...</span>
            </div>
        );
    }

    if (isConnected) {
        return (
            <div className={clsx(
                'flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm',
                className
            )}>
                <Wifi className="w-4 h-4" />
                <span>연결됨</span>
            </div>
        );
    }

    return (
        <div className={clsx(
            'flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm',
            className
        )}>
            <WifiOff className="w-4 h-4" />
            <span>연결 끊김</span>
        </div>
    );
};