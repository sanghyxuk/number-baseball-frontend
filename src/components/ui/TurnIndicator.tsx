import React from 'react';
import clsx from 'clsx';
import { Clock, User } from 'lucide-react';

interface TurnIndicatorProps {
    isMyTurn: boolean;
    playerName: string;
    className?: string;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
                                                                isMyTurn,
                                                                playerName,
                                                                className
                                                            }) => {
    return (
        <div className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-center',
            isMyTurn ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600',
            className
        )}>
            {isMyTurn ? (
                <Clock className="w-5 h-5 animate-pulse" />
            ) : (
                <User className="w-5 h-5" />
            )}
            <span className="font-medium">
        {isMyTurn ? '당신의 차례입니다' : `${playerName}의 차례`}
      </span>
        </div>
    );
};