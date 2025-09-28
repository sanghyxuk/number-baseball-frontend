import React from 'react';
import { Plus, LogIn, Gamepad2, Users, Target } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { GamePage } from '../types';
import { Button, Card, ConnectionStatus } from '../components/ui';

export const HomePage: React.FC = () => {
    const { navigateTo, isConnected, isConnecting } = useGameStore();

    const handleCreateRoom = () => {
        navigateTo(GamePage.CREATE_ROOM);
    };

    const handleJoinRoom = () => {
        navigateTo(GamePage.JOIN_ROOM);
    };

    return (
        <div className="container-game min-h-screen flex flex-col">
            {/* 헤더 */}
            <header className="text-center py-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-primary-600 p-3 rounded-full">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">숫자야구</h1>
                </div>
                <p className="text-lg text-gray-600">
                    쩡이와 나의 둘만의 비밀 숫자야구
                </p>
            </header>

            {/* 연결 상태 */}
            <div className="flex justify-center mb-8">
                <ConnectionStatus
                    isConnected={isConnected}
                    isConnecting={isConnecting}
                />
            </div>

            {/* 메인 콘텐츠 */}
            <main className="flex-1 flex flex-col justify-center">
                <div className="space-y-6">
                    {/* 게임 설명 카드 */}
                    <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
                        <div className="text-center">
                            <Gamepad2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                게임 방법
                            </h2>
                            <div className="text-gray-700 space-y-2">
                                <p>• 상대방이 생각한 숫자를 맞춰보세요</p>
                                <p>• <span className="font-bold text-game-strike">스트라이크</span>: 숫자와 자리가 모두 맞음</p>
                                <p>• <span className="font-bold text-game-ball">볼</span>: 숫자는 맞지만 자리가 틀림</p>
                                <p>• 모든 자리를 맞추면 승리!</p>
                            </div>
                        </div>
                    </Card>

                    {/* 게임 시작 옵션 */}
                    <div className="game-grid">
                        {/* 방 만들기 */}
                        <Card className="hover:shadow-xl transition-shadow duration-300">
                            <div className="text-center">
                                <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                                    <Plus className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    방 만들기
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    새로운 게임 방을 만들어<br />
                                    친구를 초대해보세요
                                </p>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleCreateRoom}
                                    className="w-full"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    방 만들기
                                </Button>
                            </div>
                        </Card>

                        {/* 방 참가하기 */}
                        <Card className="hover:shadow-xl transition-shadow duration-300">
                            <div className="text-center">
                                <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                                    <LogIn className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    방 참가하기
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    친구가 만든 방에<br />
                                    코드로 참가해보세요
                                </p>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handleJoinRoom}
                                    className="w-full"
                                >
                                    <LogIn className="w-5 h-5 mr-2" />
                                    코드 입력
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* 추가 정보 */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="w-5 h-5 text-gray-600" />
                            <h4 className="font-semibold text-gray-900">게임 특징</h4>
                        </div>
                        <div className="grid grid-cols-1 ipad:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                <span>실시간 1:1 대전</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                <span>3, 4, 5자리 선택</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                <span>iPad 최적화</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 푸터 */}
            <footer className="text-center py-6 text-gray-500 text-sm">
                <p>I love yujeong ❤️</p>
            </footer>
        </div>
    );
};