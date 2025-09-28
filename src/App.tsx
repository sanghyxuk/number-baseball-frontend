import React, { useEffect } from 'react';
import { useGameStore, useCurrentPage } from './stores/gameStore';
import { GamePage } from './types';
import { useGameWebSocket } from './hooks/useGameWebSocket';

// 실제 페이지 컴포넌트들 import
import { HomePage } from './pages/HomePage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { JoinRoomPage } from './pages/JoinRoomPage';
import { WaitingPage } from './pages/WaitingPage';
import { SetAnswerPage } from './pages/SetAnswerPage';
import { PlayingPage } from './pages/PlayingPage';
import { ResultPage } from './pages/ResultPage';

function App() {
  const currentPage = useCurrentPage();
  const { resetGame, setWebSocketActions } = useGameStore();

  // WebSocket 훅 사용 (자동으로 연결 관리됨)
  const webSocketActions = useGameWebSocket();

  // WebSocket 액션들을 스토어에 설정
  useEffect(() => {
    setWebSocketActions({
      sendReady: webSocketActions.sendReady,
      sendAnswer: webSocketActions.sendAnswer,
      sendGuess: webSocketActions.sendGuess,
      sendAbandon: webSocketActions.sendAbandon,
    });
  }, [webSocketActions.sendReady, webSocketActions.sendAnswer, webSocketActions.sendGuess, webSocketActions.sendAbandon, setWebSocketActions]);

  // 페이지 새로고침시 게임 상태 초기화
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 사용자가 페이지를 떠날 때 정리 작업
      resetGame();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [resetGame]);

  // 현재 페이지에 따른 컴포넌트 렌더링
  const renderCurrentPage = () => {
    switch (currentPage) {
      case GamePage.HOME:
        return <HomePage />;

      case GamePage.CREATE_ROOM:
        return <CreateRoomPage />;

      case GamePage.JOIN_ROOM:
        return <JoinRoomPage />;

      case GamePage.WAITING:
        return <WaitingPage />;

      case GamePage.SET_ANSWER:
        return <SetAnswerPage />;

      case GamePage.PLAYING:
        return <PlayingPage />;

      case GamePage.RESULT:
        return <ResultPage />;

      default:
        console.warn('알 수 없는 페이지:', currentPage);
        return <HomePage />;
    }
  };

  return (
      <div className="App min-h-screen bg-game-bg">
        {/* 전역 스타일 및 메타 태그 */}
        <div className="hidden">
          {/* iPad 뷰포트 설정 */}
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </div>

        {/* 페이지 렌더링 */}
        <main className="animate-fade-in">
          {renderCurrentPage()}
        </main>

        {/* 개발용 디버그 정보 */}
        {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
              <div>Page: {currentPage}</div>
              <div>Env: {process.env.NODE_ENV}</div>
            </div>
        )}
      </div>
  );
}

export default App;