import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Target,
    RotateCcw,
    Home,
    Flag,
    Clock,
    Eye,
    EyeOff,
    Award,
    TrendingUp,
    Users
} from 'lucide-react';
import {
    useGameStore,
    useSessionInfo,
    usePlayerStatus,
    useGameSettings,
    useGameHistory
} from '../stores/gameStore';
import { GamePage, GameStatus } from '../types';
import { Button, Card } from '../components/ui';
import { GameHistory } from '../components/GameHistory';
import { getGameStatus, isApiSuccess } from '../api/gameApi';

export const ResultPage: React.FC = () => {
    const { status, navigateTo, resetGame, setOpponentAnswer } = useGameStore();
    const { sessionId, nickname } = useSessionInfo();
    const { myAnswer, opponentAnswer } = usePlayerStatus();
    const settings = useGameSettings();
    const history = useGameHistory();

    const [showAnswers, setShowAnswers] = useState(false);
    const [showFullHistory, setShowFullHistory] = useState(false);

    // 게임 종료 후 최종 상태 조회하여 상대방 정답 획득 시도
    useEffect(() => {
        const fetchFinalGameState = async () => {
            if (!sessionId || opponentAnswer) return; // 이미 있으면 스킵
            
            try {
                console.log('🔍 게임 종료 후 최종 상태 조회 시도...');
                const response = await getGameStatus(sessionId);
                if (isApiSuccess(response) && response.data) {
                    console.log('📊 최종 게임 상태:', response.data);
                    // 여기서 백엔드가 양쪽 정답을 제공한다면 처리
                    // 현재는 백엔드 스펙에 따라 추후 구현
                }
            } catch (error) {
                console.error('❌ 최종 상태 조회 실패:', error);
            }
        };

        fetchFinalGameState();
    }, [sessionId, opponentAnswer]);

    // 게임 결과 분석
    const analyzeGameResult = () => {
        if (history.length === 0) {
            return {
                winner: null,
                reason: 'NO_GAME',
                myTurns: 0,
                opponentTurns: 0,
                totalTurns: 0,
                winningTurn: null
            };
        }

        const myTurns = history.filter(turn => turn.guesserSessionId === sessionId);
        const opponentTurns = history.filter(turn => turn.guesserSessionId !== sessionId);
        const lastTurn = history[history.length - 1];

        // 승리 턴 찾기 (완전한 스트라이크)
        const winningTurn = history.find(turn => {
            if (!settings) return false;
            return turn.result === `${settings.digits}S`;
        });

        let winner = null;
        let reason = 'UNKNOWN';

        if (status === GameStatus.FINISHED && winningTurn) {
            winner = winningTurn.guesserSessionId;
            reason = 'WIN';
        } else if (status === GameStatus.ABANDONED) {
            // 마지막 턴이 포기한 사람의 반대가 승자
            winner = lastTurn?.guesserSessionId === sessionId ? 'opponent' : sessionId;
            reason = 'ABANDON';
        }

        return {
            winner,
            reason,
            myTurns: myTurns.length,
            opponentTurns: opponentTurns.length,
            totalTurns: history.length,
            winningTurn
        };
    };

    const gameResult = analyzeGameResult();
    const isWinner = gameResult.winner === sessionId;
    const isLoser = gameResult.winner && gameResult.winner !== sessionId;

    // 새 게임 시작
    const handleNewGame = () => {
        resetGame();
        navigateTo(GamePage.HOME);
    };

    // 홈으로 돌아가기
    const handleGoHome = () => {
        resetGame();
        navigateTo(GamePage.HOME);
    };

    // 결과 타이틀 및 아이콘
    const getResultInfo = () => {
        if (isWinner) {
            return {
                title: '🎉 승리!',
                subtitle: gameResult.reason === 'WIN' ? '축하합니다! 상대방의 숫자를 맞추셨습니다!' : '상대방이 포기했습니다.',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                icon: <Trophy className="w-12 h-12 text-green-600" />
            };
        } else if (isLoser) {
            return {
                title: '😢 패배',
                subtitle: gameResult.reason === 'WIN' ? '상대방이 당신의 숫자를 맞췄습니다.' : '게임을 포기했습니다.',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                icon: <Flag className="w-12 h-12 text-red-600" />
            };
        } else {
            return {
                title: '게임 종료',
                subtitle: '게임이 종료되었습니다.',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                textColor: 'text-gray-800',
                icon: <Target className="w-12 h-12 text-gray-600" />
            };
        }
    };

    const resultInfo = getResultInfo();

    return (
        <div className="container-game min-h-screen">
            {/* 헤더 */}
            <header className="text-center py-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">게임 결과</h1>
                <p className="text-gray-600">수고하셨습니다!</p>
            </header>

            {/* 메인 콘텐츠 */}
            <main className="space-y-6">
                {/* 결과 카드 */}
                <Card className={`${resultInfo.bgColor} ${resultInfo.borderColor}`}>
                    <div className="text-center">
                        <div className="mb-4">
                            {resultInfo.icon}
                        </div>
                        <h2 className={`text-3xl font-bold ${resultInfo.textColor} mb-2`}>
                            {resultInfo.title}
                        </h2>
                        <p className={`text-lg ${resultInfo.textColor}`}>
                            {resultInfo.subtitle}
                        </p>

                        {/* 승리 세부 정보 */}
                        {gameResult.winningTurn && (
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-yellow-600" />
                                    <span className="font-medium text-gray-900">승부 결정 순간</span>
                                </div>
                                <div className="text-2xl font-mono font-bold text-gray-900">
                                    {gameResult.winningTurn.guess}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {gameResult.winningTurn.turnNumber}번째 시도에서 정답!
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 게임 통계 */}
                <Card title="게임 통계">
                    <div className="grid grid-cols-2 ipad:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-blue-600">총 턴 수</p>
                            <p className="text-2xl font-bold text-blue-900">{gameResult.totalTurns}</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-green-600">내 시도</p>
                            <p className="text-2xl font-bold text-green-900">{gameResult.myTurns}</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <p className="text-sm text-purple-600">상대 시도</p>
                            <p className="text-2xl font-bold text-purple-900">{gameResult.opponentTurns}</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                            <p className="text-sm text-yellow-600">평균 턴</p>
                            <p className="text-2xl font-bold text-yellow-900">
                                {gameResult.totalTurns > 0 ? Math.round(gameResult.totalTurns / 2) : 0}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 정답 공개 */}
                <Card>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">정답 공개</h3>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowAnswers(!showAnswers)}
                            >
                                {showAnswers ? (
                                    <>
                                        <EyeOff className="w-4 h-4 mr-1" />
                                        숨기기
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 mr-1" />
                                        보기
                                    </>
                                )}
                            </Button>
                        </div>

                        {showAnswers && (
                            <div className="grid grid-cols-1 ipad:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-600 mb-2">내 정답</p>
                                    <div className="text-3xl font-mono font-bold text-blue-900">
                                        {myAnswer ? myAnswer : '???'}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">상대방이 맞춰야 했던 숫자</p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-red-600 mb-2">상대방 정답</p>
                                    <div className="text-3xl font-mono font-bold text-red-900">
                                        {(() => {
                                            // 1. 먼저 gameStore에서 상대방 정답 확인
                                            if (opponentAnswer) {
                                                return opponentAnswer;
                                            }
                                            
                                            // 2. 게임 히스토리에서 승부가 난 경우 분석
                                            if (settings && history.length > 0) {
                                                // 완전한 스트라이크가 나온 턴 찾기
                                                const winningTurn = history.find(turn => {
                                                    return turn.result === `${settings.digits}S` || turn.result === `${settings.digits}스트라이크`;
                                                });
                                                
                                                if (winningTurn) {
                                                    if (winningTurn.guesserSessionId === sessionId) {
                                                        // 내가 승리: 내 추측 = 상대방 정답
                                                        console.log('� 내가 승리! 상대방 정답:', winningTurn.guess);
                                                        return winningTurn.guess;
                                                    } else {
                                                        // 상대방이 승리: 상대방 추측 = 내 정답
                                                        // 상대방의 정답은 게임 중 내가 시도한 추측들 중에서 찾아야 함
                                                        console.log('😞 상대방 승리, 상대방 정답을 알 수 없음');
                                                        return '승부 끝';
                                                    }
                                                }
                                            }
                                            
                                            // 3. 게임이 아직 진행 중이거나 포기한 경우
                                            if (status === 'ABANDONED') {
                                                return '게임 포기';
                                            }
                                            
                                            return '알 수 없음';
                                        })()}
                                    </div>
                                    <p className="text-xs text-red-600 mt-1">내가 맞춰야 했던 숫자</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 게임 기록 */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">전체 게임 기록</h3>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowFullHistory(!showFullHistory)}
                        >
                            {showFullHistory ? '간략히' : '자세히'}
                        </Button>
                    </div>

                    {showFullHistory ? (
                        <GameHistory
                            history={history}
                            mySessionId={sessionId}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Target className="w-8 h-8 mx-auto mb-2" />
                            <p>자세한 기록을 보려면 '자세히' 버튼을 눌러주세요</p>
                        </div>
                    )}
                </Card>

                {/* 게임 설정 정보 */}
                {settings && (
                    <Card title="게임 설정" className="bg-gray-50">
                        <div className="grid grid-cols-2 ipad:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">자릿수:</span>
                                <span className="ml-2 font-medium">{settings.digits}자리</span>
                            </div>
                            <div>
                                <span className="text-gray-600">0 포함:</span>
                                <span className="ml-2 font-medium">{settings.allowZero ? '허용' : '금지'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">중복 숫자:</span>
                                <span className="ml-2 font-medium">{settings.allowDuplicate ? '허용' : '금지'}</span>
                            </div>
                        </div>
                    </Card>
                )}
            </main>

            {/* 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-bottom">
                <div className="container-game">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={handleGoHome}
                            className="flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            홈으로
                        </Button>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleNewGame}
                            className="flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            다시 하기
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};