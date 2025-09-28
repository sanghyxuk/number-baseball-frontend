import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, Clock, Users } from 'lucide-react';
import { useGameStore, useSessionInfo, useGameSettings } from '../stores/gameStore';
import { Card, ErrorMessage, ConnectionStatus, LoadingSpinner } from '../components/ui';
import { Keypad, NumberDisplay, validateNumberInput } from '../components/Keypad';

export const SetAnswerPage: React.FC = () => {
    const { status, isConnected, sendAnswer, setMyAnswer } = useGameStore();
    const { sessionId, nickname } = useSessionInfo();
    const settings = useGameSettings();

    const [currentInput, setCurrentInput] = useState('');
    const [myAnswerSet, setMyAnswerSet] = useState(false);
    const [opponentAnswerSet, setOpponentAnswerSet] = useState(false);
    const [showInput, setShowInput] = useState(true);
    const [error, setError] = useState<string>();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 숫자 입력 처리
    const handleNumberPress = (number: string) => {
        if (!settings || currentInput.length >= settings.digits || myAnswerSet) {
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
        if (myAnswerSet) return;

        setCurrentInput(prev => prev.slice(0, -1));
        setError(undefined);
    };

    // 정답 제출
    const handleSubmit = async () => {
        if (!settings || myAnswerSet || isSubmitting) return;

        // 입력 검증
        const validation = validateNumberInput(currentInput, settings);
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        setIsSubmitting(true);
        setError(undefined);

        try {
            const success = sendAnswer(currentInput);
            if (success) {
                // gameStore에 내 정답 저장
                setMyAnswer(currentInput);
                setMyAnswerSet(true);
                setShowInput(false);
                console.log('✅ 내 정답 설정 완료:', currentInput);
            } else {
                setError('정답 전송에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('정답 제출 실패:', error);
            setError('정답 제출 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 입력 보기/숨기기 토글
    const toggleShowInput = () => {
        setShowInput(!showInput);
    };

    // 게임 설정이 없으면 로딩
    if (!settings) {
        return (
            <div className="container-game min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600">게임 설정을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const bothAnswersSet = myAnswerSet && opponentAnswerSet;
    const canInteract = !myAnswerSet && isConnected;

    return (
        <div className="container-game min-h-screen">
            {/* 헤더 */}
            <header className="text-center py-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Lock className="w-6 h-6 text-primary-600" />
                    <h1 className="text-2xl font-bold text-gray-900">정답 설정</h1>
                </div>
                <p className="text-gray-600">
                    상대방이 맞춰야 할 숫자를 설정하세요
                </p>
                <div className="flex justify-center mt-4">
                    <ConnectionStatus isConnected={isConnected} isConnecting={false} />
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
                {/* 게임 설정 안내 */}
                <Card>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">게임 규칙</h3>
                        <div className="grid grid-cols-1 ipad:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="font-medium text-blue-900">{settings.digits}자리 숫자</p>
                                <p className="text-blue-700">정확히 {settings.digits}개의 숫자</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="font-medium text-green-900">
                                    0 {settings.allowZero ? '허용' : '금지'}
                                </p>
                                <p className="text-green-700">
                                    {settings.allowZero ? '0을 사용할 수 있음' : '0은 사용 불가'}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="font-medium text-purple-900">
                                    중복 {settings.allowDuplicate ? '허용' : '금지'}
                                </p>
                                <p className="text-purple-700">
                                    {settings.allowDuplicate ? '같은 숫자 반복 가능' : '모든 숫자 다름'}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 정답 입력 영역 */}
                <Card>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-900">내 정답 설정</h3>
                            {myAnswerSet && (
                                <button
                                    onClick={toggleShowInput}
                                    className="p-1 rounded hover:bg-gray-100"
                                    title={showInput ? '숨기기' : '보기'}
                                >
                                    {showInput ? (
                                        <EyeOff className="w-5 h-5 text-gray-500" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-500" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* 숫자 표시 */}
                        <NumberDisplay
                            value={showInput ? currentInput : ''}
                            maxLength={settings.digits}
                            placeholder={showInput ? '?' : '●'}
                        />

                        {/* 상태별 메시지 */}
                        {myAnswerSet ? (
                            <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">정답이 설정되었습니다</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                                <Clock className="w-5 h-5" />
                                <span>정답을 입력해주세요</span>
                            </div>
                        )}

                        {/* 키패드 */}
                        {!myAnswerSet && (
                            <Keypad
                                settings={settings}
                                currentInput={currentInput}
                                maxLength={settings.digits}
                                onNumberPress={handleNumberPress}
                                onBackspace={handleBackspace}
                                onSubmit={handleSubmit}
                                disabled={!canInteract || isSubmitting}
                                submitLabel={isSubmitting ? '전송 중...' : '정답 설정'}
                            />
                        )}
                    </div>
                </Card>

                {/* 상대방 상태 */}
                <Card>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-bold text-gray-900">상대방 상태</h3>
                        </div>

                        <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                                상
                            </div>
                            <div className="text-left">
                                <p className="font-medium">상대방</p>
                                <div className="flex items-center gap-2">
                                    {opponentAnswerSet ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-sm text-green-600">정답 설정 완료</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-500">정답 설정 중...</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 게임 시작 대기 */}
                {bothAnswersSet && (
                    <Card className="bg-green-50 border-green-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                모든 준비 완료!
                            </h3>
                            <p className="text-gray-700 mb-4">
                                양쪽 모두 정답을 설정했습니다.<br />
                                곧 게임이 시작됩니다!
                            </p>
                            <LoadingSpinner size="md" className="mx-auto" />
                        </div>
                    </Card>
                )}

                {/* 도움말 */}
                {!myAnswerSet && (
                    <Card className="bg-gray-50">
                        <div className="text-center">
                            <h4 className="font-medium text-gray-900 mb-2">💡 팁</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• 상대방이 맞추기 어려운 숫자를 선택하세요</p>
                                <p>• 너무 쉬운 패턴(1234, 1111 등)은 피하세요</p>
                                <p>• 설정한 정답은 게임 중에 변경할 수 없습니다</p>
                            </div>
                        </div>
                    </Card>
                )}
            </main>
        </div>
    );
};