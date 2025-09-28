import React, { useState } from 'react';
import { ArrowLeft, Settings, User, Hash, ToggleLeft, ToggleRight } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { GamePage, CreateRoomRequest } from '../types';
import { Button, Card, Input, ErrorMessage, LoadingSpinner } from '../components/ui';
import { createRoom, isApiSuccess, validateGameSettings, formatErrorMessage } from '../api/gameApi';

export const CreateRoomPage: React.FC = () => {
    const { navigateTo, setSession, setRoom, setLoading, isLoading } = useGameStore();

    // 예시 숫자 생성 함수
    const generateExample = (digits: number, allowZero: boolean, allowDuplicate: boolean): string => {
        if (allowDuplicate) {
            // 중복 허용시
            if (allowZero) {
                const examples = ['102', '1023', '10234', '102345'];
                return examples[digits - 3] || '102345';
            } else {
                const examples = ['123', '1234', '12345', '123456'];
                return examples[digits - 3] || '123456';
            }
        } else {
            // 중복 금지시
            if (allowZero) {
                const examples = ['102', '1024', '10245', '102456'];
                return examples[digits - 3] || '102456';
            } else {
                const examples = ['123', '1235', '12356', '123567'];
                return examples[digits - 3] || '123567';
            }
        }
    };

    // 폼 상태
    const [formData, setFormData] = useState<CreateRoomRequest>({
        nickname: '',
        digits: 4,
        allowZero: false,
        allowDuplicate: false
    });
    const [error, setError] = useState<string>();

    // 뒤로가기
    const handleBack = () => {
        navigateTo(GamePage.HOME);
    };

    // 폼 입력 처리
    const handleInputChange = (field: keyof CreateRoomRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(undefined); // 입력시 에러 메시지 제거
    };

    // 방 생성 처리
    const handleCreateRoom = async () => {
        // 클라이언트 측 유효성 검사
        const validation = validateGameSettings(formData);
        if (!validation.isValid) {
            setError(validation.errors[0]);
            return;
        }

        setLoading(true);
        setError(undefined);

        try {
            const response = await createRoom(formData);

            if (isApiSuccess(response)) {
                // 성공: 세션 정보 저장 및 대기 화면으로 이동
                setSession(response.data.sessionId, formData.nickname);
                setRoom(response.data.roomCode, response.data.settings, true); // isCreator = true

                // 방장이 방을 생성했으므로 WAITING_FOR_JOINER 상태로 시작
                console.log('🏠 방 생성 완료 - 참가자 대기 중');
                
                // WebSocket 연결은 useGameWebSocket 훅에서 자동으로 처리됨
            } else {
                setError(formatErrorMessage(response.message));
            }
        } catch (error) {
            console.error('방 생성 중 예외 발생:', error);
            setError('방 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-bold text-gray-900">방 만들기</h1>
                    <p className="text-gray-600">게임 설정을 선택해주세요</p>
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
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                입력하지 않으면 '방장'으로 표시됩니다
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 게임 설정 */}
                <Card title="게임 설정">
                    <div className="space-y-6">
                        {/* 자릿수 선택 */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Hash className="w-4 h-4" />
                                자릿수 선택
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[3, 4, 5].map((digit) => (
                                    <button
                                        key={digit}
                                        onClick={() => handleInputChange('digits', digit)}
                                        disabled={isLoading}
                                        className={`
                      p-4 rounded-lg border-2 font-medium transition-all
                      ${formData.digits === digit
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                        }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                                    >
                                        <div className="text-2xl font-bold mb-1">{digit}</div>
                                        <div className="text-sm">
                                            {digit === 3 && '쉬움'}
                                            {digit === 4 && '보통'}
                                            {digit === 5 && '어려움'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 고급 설정 */}
                        <div className="border-t pt-6">
                            <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-4">
                                <Settings className="w-4 h-4" />
                                고급 설정
                            </h4>

                            <div className="space-y-4">
                                {/* 0 포함 여부 */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">0 포함</p>
                                        <p className="text-sm text-gray-600">
                                            숫자에 0을 포함할지 선택하세요
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange('allowZero', !formData.allowZero)}
                                        disabled={isLoading}
                                        className="flex items-center"
                                    >
                                        {formData.allowZero ? (
                                            <ToggleRight className="w-8 h-8 text-primary-600" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                                        )}
                                    </button>
                                </div>

                                {/* 중복 허용 여부 */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">중복 숫자 허용</p>
                                        <p className="text-sm text-gray-600">
                                            같은 숫자가 여러 번 나올 수 있게 할지 선택하세요
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleInputChange('allowDuplicate', !formData.allowDuplicate)}
                                        disabled={isLoading}
                                        className="flex items-center"
                                    >
                                        {formData.allowDuplicate ? (
                                            <ToggleRight className="w-8 h-8 text-primary-600" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 설정 요약 */}
                <Card className="bg-gray-50">
                    <h4 className="font-medium text-gray-900 mb-3">게임 설정 요약</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">자릿수:</span>
                            <span className="ml-2 font-medium">{formData.digits}자리</span>
                        </div>
                        <div>
                            <span className="text-gray-600">0 포함:</span>
                            <span className="ml-2 font-medium">
                {formData.allowZero ? '허용' : '금지'}
              </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-600">중복 숫자:</span>
                            <span className="ml-2 font-medium">
                {formData.allowDuplicate ? '허용' : '금지'}
              </span>
                        </div>
                    </div>

                    {/* 예시 */}
                    <div className="mt-4 p-3 bg-white rounded border-l-4 border-primary-500">
                        <p className="text-xs text-gray-600 mb-1">예시 숫자:</p>
                        <p className="font-mono text-sm font-bold text-gray-900">
                            {generateExample(formData.digits, formData.allowZero, formData.allowDuplicate)}
                        </p>
                    </div>
                </Card>
            </main>

            {/* 하단 버튼 */}
            <div className="py-4 mt-auto">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    loading={isLoading}
                    className="w-full"
                >
                    방 만들기
                </Button>
            </div>


            {/* 로딩 오버레이 */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg flex items-center gap-3">
                        <LoadingSpinner size="md" />
                        <span className="text-gray-900">방을 생성하고 있습니다...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
