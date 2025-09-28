import React, { useState, useEffect } from 'react';
import { Copy, LogOut, Users, Settings, CheckCircle, Clock, Share } from 'lucide-react';
import { useGameStore, useSessionInfo, usePlayerStatus, useGameSettings } from '../stores/gameStore';
import { GamePage, GameStatus } from '../types';
import { Button, Card, ErrorMessage, ConnectionStatus, LoadingSpinner } from '../components/ui';
import { leaveRoom, getGameStatus, isApiSuccess } from '../api/gameApi';

export const WaitingPage: React.FC = () => {
    const { navigateTo, resetGame, status, isConnected, sendReady, updateGameStatus, setPlayerReady } = useGameStore();
    const { sessionId, nickname, roomCode } = useSessionInfo();
    const { isCreator, creatorReady, joinerReady } = usePlayerStatus();
    const settings = useGameSettings();

    // 디버깅을 위한 상태 로그
    React.useEffect(() => {
        console.log('🏠 WaitingPage 상태:', {
            sessionId,
            nickname,
            roomCode,
            isCreator,
            creatorReady,
            joinerReady,
            status,
            isConnected
        });
    }, [sessionId, nickname, roomCode, isCreator, creatorReady, joinerReady, status, isConnected]);

    // 게임 상태 주기적 확인
    useEffect(() => {
        if (!sessionId || !isConnected) return;

        const checkGameStatus = async () => {
            try {
                const response = await getGameStatus(sessionId);
                if (isApiSuccess(response) && response.data) {
                    const gameState = response.data;
                    console.log('🔄 상태 폴링 결과:', gameState);
                    
                    // 게임 상태 업데이트
                    if (gameState.status !== status) {
                        updateGameStatus(gameState.status);
                    }
                    
                    // 플레이어 준비 상태 업데이트
                    if (gameState.creatorReady !== creatorReady) {
                        setPlayerReady(true, gameState.creatorReady);
                    }
                    if (gameState.joinerReady !== joinerReady) {
                        setPlayerReady(false, gameState.joinerReady);
                    }
                }
            } catch (error) {
                console.error('❌ 상태 폴링 실패:', error);
            }
        };

        // 처음 한 번 즉시 실행
        checkGameStatus();

        // 5초마다 상태 확인
        const interval = setInterval(checkGameStatus, 5000);

        return () => clearInterval(interval);
    }, [sessionId, isConnected, status, updateGameStatus, setPlayerReady]);

    const [isReady, setIsReady] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [error, setError] = useState<string>();
    const [copySuccess, setCopySuccess] = useState(false);

    // 준비 상태 토글
    const handleToggleReady = async () => {
        const newReadyState = !isReady;

        if (sendReady(newReadyState)) {
            setIsReady(newReadyState);
            setError(undefined);
        } else {
            setError('준비 상태 변경에 실패했습니다. 연결을 확인해주세요.');
        }
    };

    // 방 코드 복사
    const handleCopyRoomCode = async () => {
        if (!roomCode) return;

        try {
            await navigator.clipboard.writeText(roomCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('클립보드 복사 실패:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = roomCode;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                setError('방 코드 복사에 실패했습니다.');
            }
            document.body.removeChild(textArea);
        }
    };

    // 방 나가기
    const handleLeaveRoom = async () => {
        if (!sessionId) return;

        const confirmed = window.confirm('정말 방을 나가시겠습니까?');
        if (!confirmed) return;

        setIsLeaving(true);

        try {
            await leaveRoom(sessionId);
            resetGame();
            navigateTo(GamePage.HOME);
        } catch (error) {
            console.error('방 나가기 실패:', error);
            setError('방 나가기에 실패했습니다.');
        } finally {
            setIsLeaving(false);
        }
    };

    // 현재 준비 상태 계산
    const myReadyState = isCreator ? creatorReady : joinerReady;
    const opponentReadyState = isCreator ? joinerReady : creatorReady;
    const bothReady = creatorReady && joinerReady;
    const waitingForJoiner = status === GameStatus.WAITING_FOR_JOINER;
    const hasJoiner = status !== GameStatus.WAITING_FOR_JOINER;

    return (
        <div className="container-game min-h-screen">
            {/* 헤더 */}
            <header className="flex items-center justify-between py-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">대기실</h1>
                    <p className="text-gray-600">
                        {waitingForJoiner ? '참가자를 기다리고 있습니다' : '게임 시작을 준비하세요'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ConnectionStatus isConnected={isConnected} isConnecting={false} />
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={handleLeaveRoom}
                        disabled={isLeaving}
                        loading={isLeaving}
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* 에러 메시지 */}
            {error && (
                <ErrorMessage
                    message={error}
                    onDismiss={() => setError(undefined)}
                    className="mb-6"
                />
            )}

            {/* 메인 콘텐츠 */}
            <main className="space-y-6">
                {/* 방 정보 */}
                <Card title="방 정보">
                    <div className="space-y-4">
                        {/* 방 코드 */}
                        <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-primary-700">방 코드</p>
                                <p className="text-2xl font-mono font-bold text-primary-900 tracking-widest">
                                    {roomCode}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCopyRoomCode}
                                className={copySuccess ? 'bg-green-100 text-green-700' : ''}
                            >
                                {copySuccess ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        복사됨!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        복사
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* 게임 설정 */}
                        {settings && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">자릿수</p>
                                    <p className="font-bold">{settings.digits}자리</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">0 포함</p>
                                    <p className="font-bold">{settings.allowZero ? '허용' : '금지'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">중복 숫자</p>
                                    <p className="font-bold">{settings.allowDuplicate ? '허용' : '금지'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 플레이어 상태 */}
                <Card title="플레이어">
                    <div className="space-y-3">
                        {/* 방장 */}
                        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                    방
                                </div>
                                <div>
                                    <p className="font-medium">{isCreator ? (nickname || '방장') : '방장'}</p>
                                    <p className="text-sm text-gray-600">게임 방장</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {creatorReady ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">준비 완료</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Clock className="w-5 h-5" />
                                        <span>대기 중</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 참가자 */}
                        <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                    참
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {hasJoiner ? 
                                            (isCreator ? '참가자' : (nickname || '참가자')) : 
                                            '참가자 대기 중...'
                                        }
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {hasJoiner ? '게임 참가자' : '방 코드를 공유해주세요'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!hasJoiner ? (
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Users className="w-5 h-5" />
                                        <span>대기 중</span>
                                    </div>
                                ) : joinerReady ? (
                                    <div className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">준비 완료</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-gray-500">
                                        <Clock className="w-5 h-5" />
                                        <span>대기 중</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 게임 시작 준비 */}
                {hasJoiner && (
                    <Card>
                        <div className="text-center">
                            {bothReady ? (
                                <div className="space-y-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            모든 플레이어 준비 완료!
                                        </h3>
                                        <p className="text-gray-600">
                                            곧 정답 설정 단계로 이동합니다...
                                        </p>
                                    </div>
                                    <LoadingSpinner size="md" className="mx-auto" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                                        myReadyState ? 'bg-green-100' : 'bg-gray-100'
                                    }`}>
                                        {myReadyState ? (
                                            <CheckCircle className="w-8 h-8 text-green-600" />
                                        ) : (
                                            <Clock className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            게임 시작 준비
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {myReadyState ?
                                                '상대방이 준비할 때까지 기다려주세요' :
                                                '준비가 되었으면 아래 버튼을 눌러주세요'
                                            }
                                        </p>
                                    </div>
                                    <Button
                                        variant={myReadyState ? "secondary" : "primary"}
                                        size="lg"
                                        onClick={handleToggleReady}
                                        disabled={!isConnected}
                                        className="w-full max-w-sm mx-auto"
                                    >
                                        {myReadyState ? (
                                            <>
                                                <Clock className="w-5 h-5 mr-2" />
                                                준비 취소
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                게임 시작 준비
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* 참가자 대기 중 안내 */}
                {waitingForJoiner && isCreator && (
                    <Card className="bg-blue-50 border-blue-200">
                        <div className="text-center">
                            <Share className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                친구를 초대하세요
                            </h3>
                            <div className="text-gray-700 space-y-2 text-sm">
                                <p>• 위의 방 코드를 친구에게 공유해주세요</p>
                                <p>• 친구가 방에 입장하면 게임을 시작할 수 있습니다</p>
                                <p>• 복사 버튼을 눌러 방 코드를 쉽게 공유하세요</p>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
};