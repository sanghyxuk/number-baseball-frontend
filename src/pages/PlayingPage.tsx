import React, { useState } from 'react';
import { Flag, Target, Clock, User, AlertTriangle } from 'lucide-react';
import {
    useGameStore,
    useSessionInfo,
    usePlayerStatus,
    useGameSettings,
    useGameHistory
} from '../stores/gameStore';
import { GamePage } from '../types';
import {
    Button,
    Card,
    ErrorMessage,
    ConnectionStatus,
    TurnIndicator
} from '../components/ui';
import {
    Keypad,
    NumberDisplay,
    validateNumberInput
} from '../components/Keypad';
import {
    GameHistory,
    GameHistorySummary
} from '../components/GameHistory';

export const PlayingPage: React.FC = () => {
    const { navigateTo, isConnected, sendGuess, sendAbandon } = useGameStore();
    const { sessionId, nickname } = useSessionInfo();
    const { isMyTurn, currentTurn, myAnswer } = usePlayerStatus();
    const settings = useGameSettings();
    const history = useGameHistory();

    // 디버깅: myAnswer 값 추적
    React.useEffect(() => {
        console.log('🎯 PlayingPage - myAnswer 상태:', myAnswer);
    }, [myAnswer]);

    const [currentInput, setCurrentInput] = useState('');
    const [error, setError] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // 숫자 입력 처리
    const handleNumberPress = (number: string) => {
        if (!settings || currentInput.length >= settings.digits || !isMyTurn || isSubmitting) {
            return;
        }

        // 중복 허용 안하는 경우 이미 입력된 숫자는 추가 안함
        if (!settings.allowDuplicate && currentInput.includes(number)) {
            setError('이미 입력된 숫자입니다.');
            return;
        }

        setCurrentInput(prev => prev + number);
        setError(undefined);
    };

    // 백스페이스 처리
    const handleBackspace = () => {
        if (!isMyTurn || isSubmitting) return;

        setCurrentInput(prev => prev.slice(0, -1));
        setError(undefined);
    };

    // 추측 제출
    const handleSubmitGuess = async () => {
        if (!settings || !isMyTurn || isSubmitting) return;

        // 입력 검증
        const validation = validateNumberInput(currentInput, settings);
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        setIsSubmitting(true);
        setError(undefined);

        try {
            const success = sendGuess(currentInput);
            if (success) {
                // 입력 초기화
                setCurrentInput('');
                console.log('추측 전송:', currentInput);
            } else {
                setError('추측 전송에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('추측 제출 실패:', error);
            setError('추측 제출 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 게임 포기
    const handleAbandonGame = async () => {
        const confirmed = window.confirm(
            '정말 게임을 포기하시겠습니까?\n포기하면 상대방이 승리하게 됩니다.'
        );

        if (!confirmed) return;

        try {
            const success = sendAbandon();
            if (success) {
                console.log('게임 포기');
                // 결과 페이지로 이동은 WebSocket 메시지로 처리됨
            } else {
                setError('게임 포기 요청에 실패했습니다.');
            }
        } catch (error) {
            console.error('게임 포기 실패:', error);
            setError('게임 포기 중 오류가 발생했습니다.');
        }
    };

    // 게임 설정이 없으면 홈으로
    if (!settings) {
        return (
            <div className="container-game min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">게임 정보를 불러올 수 없습니다.</p>
                    <Button
                        variant="primary"
                        onClick={() => navigateTo(GamePage.HOME)}
                    >
                        홈으로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    const canInteract = isMyTurn && isConnected && !isSubmitting;
    const opponentNickname = '상대방'; // 실제로는 상대방 닉네임 가져오기

    return (
        <div className="container-game min-h-screen">
            {/* 헤더 */}
            <header className="py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-primary-600" />
                        <h1 className="text-2xl font-bold text-gray-900">숫자야구</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ConnectionStatus isConnected={isConnected} isConnecting={false} />
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleAbandonGame}
                            className="flex items-center gap-1"
                        >
                            <Flag className="w-4 h-4" />
                            <span className="hidden ipad:inline">포기</span>
                        </Button>
                    </div>
                </div>

                {/* 내 정답 표시 */}
                {myAnswer ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-800">내 정답:</span>
                            <span className="font-mono text-lg font-bold text-green-900 tracking-wider">
                                {myAnswer}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm font-medium text-yellow-800">
                                정답이 설정되지 않았습니다
                            </span>
                        </div>
                    </div>
                )}

                {/* 턴 표시 */}
                <TurnIndicator
                    isMyTurn={isMyTurn}
                    playerName={isMyTurn ? (nickname || '나') : opponentNickname}
                />
            </header>

            {/* 에러 메시지 */}
            {error && (
                <ErrorMessage
                    message={error}
                    onDismiss={() => setError(undefined)}
                    className="mb-4"
                />
            )}

            {/* 메인 콘텐츠 */}
            <main className="space-y-6">
                {/* 현재 입력 영역 */}
                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            {isMyTurn ? '숫자를 추측하세요' : '상대방이 추측 중입니다'}
                        </h3>

                        {/* 숫자 표시 */}
                        <NumberDisplay
                            value={currentInput}
                            maxLength={settings.digits}
                            className="mb-6"
                        />

                        {/* 턴별 메시지 */}
                        {isMyTurn ? (
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2 text-primary-600 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">당신의 차례입니다</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    상대방의 {settings.digits}자리 숫자를 맞춰보세요
                                </p>
                            </div>
                        ) : (
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">상대방의 차례</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    상대방이 추측할 때까지 기다려주세요
                                </p>
                            </div>
                        )}

                        {/* 키패드 */}
                        {isMyTurn && (
                            <Keypad
                                settings={settings}
                                currentInput={currentInput}
                                maxLength={settings.digits}
                                onNumberPress={handleNumberPress}
                                onBackspace={handleBackspace}
                                onSubmit={handleSubmitGuess}
                                disabled={!canInteract}
                                submitLabel={isSubmitting ? '전송 중...' : '추측하기'}
                            />
                        )}
                    </div>
                </Card>

                {/* 게임 기록 영역 */}
                <div className="grid grid-cols-1 ipad-pro:grid-cols-3 gap-6">
                    {/* 메인 히스토리 (모바일에서는 토글) */}
                    <div className="ipad-pro:col-span-2">
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">게임 기록</h3>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="ipad-pro:hidden"
                                >
                                    {showHistory ? '숨기기' : '기록 보기'}
                                </Button>
                            </div>

                            <div className={`${showHistory ? 'block' : 'hidden'} ipad-pro:block`}>
                                <GameHistory
                                    history={history}
                                    mySessionId={sessionId}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* 사이드바 - 요약 정보 */}
                    <div className="space-y-4">
                        {/* 게임 정보 요약 */}
                        <Card>
                            <h4 className="font-bold text-gray-900 mb-3">게임 정보</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">자릿수:</span>
                                    <span className="font-medium">{settings.digits}자리</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">0 포함:</span>
                                    <span className="font-medium">{settings.allowZero ? '허용' : '금지'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">중복:</span>
                                    <span className="font-medium">{settings.allowDuplicate ? '허용' : '금지'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">총 턴:</span>
                                    <span className="font-medium">{history.length}번</span>
                                </div>
                            </div>
                        </Card>

                        {/* 히스토리 요약 */}
                        <Card>
                            <GameHistorySummary
                                history={history}
                                mySessionId={sessionId}
                            />
                        </Card>

                        {/* 게임 도움말 */}
                        <Card className="bg-yellow-50 border-yellow-200">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-900 mb-2">💡 도움말</h4>
                                    <div className="text-sm text-yellow-800 space-y-1">
                                        <p>• <span className="font-bold text-game-strike">스트라이크</span>: 숫자와 위치가 정확</p>
                                        <p>• <span className="font-bold text-game-ball">볼</span>: 숫자는 맞지만 위치가 틀림</p>
                                        <p>• <span className="font-bold text-game-out">아웃</span>: 맞는 숫자가 없음</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};