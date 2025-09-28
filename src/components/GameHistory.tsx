import React from 'react';
import clsx from 'clsx';
import { Target, User, Clock } from 'lucide-react';
import { GameTurn } from '../types';

interface GameHistoryProps {
    history: GameTurn[];
    mySessionId?: string;
    className?: string;
}

interface HistoryItemProps {
    turn: GameTurn;
    isMyTurn: boolean;
    turnIndex: number;
}

// 스트라이크/볼 결과 파싱
const parseResult = (result: string): { strikes: number; balls: number; isOut: boolean } => {
    if (result === 'OUT') {
        return { strikes: 0, balls: 0, isOut: true };
    }

    const strikeMatch = result.match(/(\d+)S/);
    const ballMatch = result.match(/(\d+)B/);

    return {
        strikes: strikeMatch ? parseInt(strikeMatch[1]) : 0,
        balls: ballMatch ? parseInt(ballMatch[1]) : 0,
        isOut: false
    };
};

// 결과 표시 컴포넌트
const ResultDisplay: React.FC<{ result: string }> = ({ result }) => {
    const { strikes, balls, isOut } = parseResult(result);

    if (isOut) {
        return (
            <span className="result-out font-bold">OUT</span>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {strikes > 0 && (
                <span className="result-strike font-bold">
          {strikes}S
        </span>
            )}
            {balls > 0 && (
                <span className="result-ball font-bold">
          {balls}B
        </span>
            )}
            {strikes === 0 && balls === 0 && (
                <span className="result-out font-bold">OUT</span>
            )}
        </div>
    );
};

// 개별 히스토리 아이템
const HistoryItem: React.FC<HistoryItemProps> = ({ turn, isMyTurn, turnIndex }) => {
    const { strikes, balls } = parseResult(turn.result);
    const isWinningTurn = strikes > 0 && turn.result.includes(strikes + 'S') && !turn.result.includes('B');

    return (
        <div className={clsx(
            'flex items-center gap-4 p-4 rounded-lg border transition-all',
            isMyTurn
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200',
            isWinningTurn && 'ring-2 ring-green-500 bg-green-50'
        )}>
            {/* 턴 번호 */}
            <div className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                isMyTurn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white'
            )}>
                {turnIndex + 1}
            </div>

            {/* 플레이어 표시 */}
            <div className="flex items-center gap-2">
                <User className={clsx(
                    'w-4 h-4',
                    isMyTurn ? 'text-blue-600' : 'text-gray-600'
                )} />
                <span className="text-sm font-medium text-gray-700">
          {isMyTurn ? '나' : '상대방'}
        </span>
            </div>

            {/* 추측 숫자 */}
            <div className="flex-1">
                <div className="font-mono text-lg font-bold text-gray-900 tracking-wider">
                    {turn.guess}
                </div>
            </div>

            {/* 결과 */}
            <div className="text-right">
                <ResultDisplay result={turn.result} />
                {isWinningTurn && (
                    <div className="text-xs text-green-600 font-medium mt-1">
                        🎉 승리!
                    </div>
                )}
            </div>

            {/* 시간 */}
            <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
          {new Date(turn.timestamp).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit'
          })}
        </span>
            </div>
        </div>
    );
};

// 메인 게임 히스토리 컴포넌트
export const GameHistory: React.FC<GameHistoryProps> = ({
                                                            history,
                                                            mySessionId,
                                                            className
                                                        }) => {

    if (history.length === 0) {
        return (
            <div className={clsx(
                'text-center py-8 text-gray-500',
                className
            )}>
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">아직 추측이 없습니다</p>
                <p className="text-sm">첫 번째 숫자를 추측해보세요!</p>
            </div>
        );
    }

    return (
        <div className={clsx('space-y-3', className)}>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    게임 기록
                </h3>
                <span className="text-sm text-gray-500">
          총 {history.length}번의 추측
        </span>
            </div>

            {/* 히스토리 목록 (최신순) */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {history
                    .slice() // 원본 배열 보호
                    .reverse() // 최신순으로 표시
                    .map((turn, index) => (
                        <HistoryItem
                            key={turn.turnNumber}
                            turn={turn}
                            isMyTurn={turn.guesserSessionId === mySessionId}
                            turnIndex={history.length - 1 - index} // 실제 턴 번호
                        />
                    ))
                }
            </div>

            {/* 통계 정보 */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-center">
                <div>
                    <p className="text-sm text-gray-600">내 추측</p>
                    <p className="text-lg font-bold text-blue-600">
                        {history.filter(turn => turn.guesserSessionId === mySessionId).length}번
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">상대 추측</p>
                    <p className="text-lg font-bold text-gray-600">
                        {history.filter(turn => turn.guesserSessionId !== mySessionId).length}번
                    </p>
                </div>
            </div>
        </div>
    );
};

// 간단한 히스토리 요약 컴포넌트 (게임 진행 중 사이드바용)
export const GameHistorySummary: React.FC<GameHistoryProps> = ({
                                                                   history,
                                                                   mySessionId,
                                                                   className
                                                               }) => {
    const myTurns = history.filter(turn => turn.guesserSessionId === mySessionId);
    const opponentTurns = history.filter(turn => turn.guesserSessionId !== mySessionId);
    const lastTurn = history[history.length - 1];

    return (
        <div className={clsx('space-y-3', className)}>
            {/* 최근 결과 */}
            {lastTurn && (
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">최근 결과</span>
                        <span className="text-xs text-gray-500">
              턴 {lastTurn.turnNumber}
            </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
            <span className="font-mono font-bold">
              {lastTurn.guess}
            </span>
                        <ResultDisplay result={lastTurn.result} />
                    </div>
                </div>
            )}

            {/* 턴 카운트 */}
            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600">내 시도</p>
                    <p className="font-bold text-blue-900">{myTurns.length}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-600">상대 시도</p>
                    <p className="font-bold text-gray-900">{opponentTurns.length}</p>
                </div>
            </div>
        </div>
    );
};