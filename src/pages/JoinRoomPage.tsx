import React, { useState } from 'react';
import { ArrowLeft, LogIn, User, Hash } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { GamePage, JoinRoomRequest } from '../types';
import { Button, Card, Input, ErrorMessage, LoadingSpinner } from '../components/ui';
import { joinRoom, getGameStatus, isApiSuccess, isValidRoomCode, isValidNickname, formatErrorMessage } from '../api/gameApi';

export const JoinRoomPage: React.FC = () => {
    const { navigateTo, setSession, setRoom, setLoading, isLoading, updateGameStatus } = useGameStore();

    // 폼 상태
    const [formData, setFormData] = useState<JoinRoomRequest>({
        roomCode: '',
        nickname: ''
    });
    const [error, setError] = useState<string>();

    // 뒤로가기
    const handleBack = () => {
        navigateTo(GamePage.HOME);
    };

    // 폼 입력 처리
    const handleInputChange = (field: keyof JoinRoomRequest, value: string) => {
        let processedValue = value;

        // 방 코드는 대문자로 변환
        if (field === 'roomCode') {
            processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        }

        setFormData(prev => ({ ...prev, [field]: processedValue }));
        setError(undefined); // 입력시 에러 메시지 제거
    };

    // 클라이언트 측 유효성 검사
    const validateForm = (): string | null => {
        if (!formData.roomCode.trim()) {
            return '방 코드를 입력해주세요.';
        }

        if (!isValidRoomCode(formData.roomCode)) {
            return '방 코드는 6자리 영문/숫자 조합이어야 합니다.';
        }

        if (formData.nickname && !isValidNickname(formData.nickname)) {
            return '닉네임은 1-10자의 한글, 영문, 숫자만 허용됩니다.';
        }

        return null;
    };

    // 방 참가 처리
    const handleJoinRoom = async () => {
        // 클라이언트 측 유효성 검사
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(undefined);

        try {
            const response = await joinRoom(formData);

            if (isApiSuccess(response)) {
                // 성공: 세션 정보 저장 및 대기 화면으로 이동
                setSession(response.data.sessionId, formData.nickname);
                setRoom(response.data.roomCode, response.data.settings, false); // isCreator = false

                // 백엔드에서 받은 게임 상태로 업데이트
                if (response.data.status) {
                    updateGameStatus(response.data.status);
                    console.log('🎮 방 참가 완료 - 게임 상태:', response.data.status);
                }

                // 잠시 후 게임 상태를 다시 확인 (백엔드 상태 동기화를 위해)
                setTimeout(async () => {
                    try {
                        const statusResponse = await getGameStatus(response.data.sessionId);
                        if (isApiSuccess(statusResponse) && statusResponse.data) {
                            console.log('🔄 방 입장 후 상태 재확인:', statusResponse.data);
                            updateGameStatus(statusResponse.data.status);
                        }
                    } catch (error) {
                        console.error('❌ 상태 재확인 실패:', error);
                    }
                }, 1000);
                
                // WebSocket 연결은 useGameWebSocket 훅에서 자동으로 처리됨
            } else {
                setError(formatErrorMessage(response.message));
            }
        } catch (error) {
            console.error('방 참가 중 예외 발생:', error);
            setError('방 참가 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 엔터키 처리
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isLoading) {
            handleJoinRoom();
        }
    };

    return (
        <div className="container-game min-h-screen">
            {/* 헤더 */}
            <header className="flex items-center gap-4 py-6">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBack}
                    disabled={isLoading}
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">방 참가하기</h1>
                    <p className="text-gray-600">친구가 만든 방에 참가해보세요</p>
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
                {/* 방 코드 입력 */}
                <Card title="방 코드 입력">
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Hash className="w-4 h-4" />
                                방 코드
                            </label>
                            <Input
                                type="text"
                                placeholder="6자리 방 코드를 입력하세요 (예: ABC123)"
                                value={formData.roomCode}
                                onChange={(value) => handleInputChange('roomCode', value)}
                                maxLength={6}
                                disabled={isLoading}
                                className="text-center text-2xl font-mono tracking-widest"
                                onKeyPress={handleKeyPress}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                방장에게 받은 6자리 코드를 입력하세요
                            </p>
                        </div>

                        {/* 방 코드 유효성 표시 */}
                        {formData.roomCode && (
                            <div className={`p-3 rounded-lg text-sm ${
                                isValidRoomCode(formData.roomCode)
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}>
                                {isValidRoomCode(formData.roomCode) ? (
                                    <span>✅ 올바른 방 코드 형식입니다</span>
                                ) : (
                                    <span>⚠️ 6자리 영문/숫자 조합이어야 합니다</span>
                                )}
                            </div>
                        )}
                    </div>
                </Card>

                {/* 플레이어 정보 */}
                <Card title="플레이어 정보">
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4" />
                                닉네임 (선택사항)
                            </label>
                            <Input
                                type="text"
                                placeholder="닉네임을 입력하세요 (최대 10자)"
                                value={formData.nickname}
                                onChange={(value) => handleInputChange('nickname', value)}
                                maxLength={10}
                                disabled={isLoading}
                                onKeyPress={handleKeyPress}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                입력하지 않으면 '참가자'로 표시됩니다
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 방 참가 안내 */}
                <Card className="bg-blue-50 border-blue-200">
                    <div className="text-center">
                        <LogIn className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            방 참가 안내
                        </h3>
                        <div className="text-gray-700 space-y-2 text-sm">
                            <p>• 방장이 설정한 게임 규칙을 따릅니다</p>
                            <p>• 방 코드가 틀리면 참가할 수 없습니다</p>
                            <p>• 이미 게임이 시작된 방에는 참가할 수 없습니다</p>
                            <p>• 방장과 함께 준비 완료 후 게임이 시작됩니다</p>
                        </div>
                    </div>
                </Card>

                {/* 시뮬레이션 키패드 (iPad 친화적) */}
                <Card title="빠른 입력" className="ipad:block hidden">
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((letter) => (
                            <button
                                key={letter}
                                onClick={() => {
                                    if (formData.roomCode.length < 6) {
                                        handleInputChange('roomCode', formData.roomCode + letter);
                                    }
                                }}
                                disabled={isLoading || formData.roomCode.length >= 6}
                                className="keypad-btn"
                            >
                                {letter}
                            </button>
                        ))}
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((number) => (
                            <button
                                key={number}
                                onClick={() => {
                                    if (formData.roomCode.length < 6) {
                                        handleInputChange('roomCode', formData.roomCode + number);
                                    }
                                }}
                                disabled={isLoading || formData.roomCode.length >= 6}
                                className="keypad-btn"
                            >
                                {number}
                            </button>
                        ))}
                        <button
                            onClick={() => {
                                handleInputChange('roomCode', formData.roomCode.slice(0, -1));
                            }}
                            disabled={isLoading || formData.roomCode.length === 0}
                            className="keypad-btn col-span-3 bg-red-50 text-red-600 hover:bg-red-100"
                        >
                            ← 지우기
                        </button>
                    </div>
                </Card>
            </main>

            {/* 하단 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-bottom">
                <div className="container-game">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleJoinRoom}
                        disabled={isLoading || !formData.roomCode}
                        loading={isLoading}
                        className="w-full"
                    >
                        <LogIn className="w-5 h-5 mr-2" />
                        방 참가하기
                    </Button>
                </div>
            </div>

            {/* 로딩 오버레이 */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg flex items-center gap-3">
                        <LoadingSpinner size="md" />
                        <span className="text-gray-900">방에 참가하고 있습니다...</span>
                    </div>
                </div>
            )}
        </div>
    );
};